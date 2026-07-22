import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Server-side auth guard for protected pages. The client-side `useAuth()`
 * context is UI-only — every protected page/route must derive identity from
 * the validated Supabase session via this helper (api-validation rule).
 */
export async function requireUser(next: string): Promise<User> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
