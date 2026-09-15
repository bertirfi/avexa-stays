import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * 1. PostHog proxy (`/lumen/*`, the api_host in lib/analytics.ts).
 * 2. One canonical URL per page (/locations/ → /locations).
 * 3. Refreshes the Supabase auth session cookie on every request (canonical
 *    @supabase/ssr pattern). Graceful no-op if Supabase env is missing.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // PostHog EU behind our own origin: blockers drop *.posthog.com, which would
  // skew the booking funnel. Proxied here rather than with next.config rewrites
  // because a rewrite forwards the browser's cookies — the Supabase session
  // (tokens, email, name) among them — to PostHog. The path is deliberately
  // non-descriptive (blockers match /analytics, /ingest, …).
  // ponytail: replays (~1–5 MB/session) count toward Vercel data transfer;
  // switch to PostHog's managed reverse proxy (a CNAME) if that shows on the bill.
  if (pathname.startsWith('/lumen/')) {
    const assets = pathname.startsWith('/lumen/static/') || pathname.startsWith('/lumen/array/');
    const host = assets ? 'eu-assets.i.posthog.com' : 'eu.i.posthog.com';
    const headers = new Headers(request.headers);
    headers.delete('cookie');
    headers.delete('authorization');
    headers.set('host', host);
    return NextResponse.rewrite(`https://${host}${pathname.slice('/lumen'.length)}${search}`, {
      request: { headers },
    });
  }

  // next.config.ts turns off Next's own trailing-slash redirect (it runs before
  // middleware and would bounce PostHog's /e/ endpoints); pages keep one URL here.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    // A plain URL, not nextUrl.clone(): NextURL remembers the original trailing
    // slash and re-appends it, which would redirect the page to itself.
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(url, 308);
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() (not getSession) validates + refreshes the token.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
