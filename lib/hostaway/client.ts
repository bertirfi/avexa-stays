import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  HostawayCalendarDay,
  HostawayListing,
  HostawayResponse,
  HostawayTokenResponse,
} from './types';

/**
 * Hostaway API client. Server-only.
 *
 * Auth: POST /v1/accessTokens (client_credentials). The token is valid ~24
 * months, so we cache it in Supabase (`integration_tokens`) and reuse it
 * across requests/instances instead of regenerating per call.
 *
 * Rate limits: 15 req/10s per IP, 20 req/10s per account. We never call
 * Hostaway on a visitor request — only from sync jobs/crons — and space calls
 * conservatively here as an extra guard.
 */

const BASE = 'https://api.hostaway.com/v1';
const PROVIDER = 'hostaway';
const MIN_CALL_SPACING_MS = 750; // ~13 req / 10s ceiling, under the 15/10s limit
const TOKEN_SAFETY_WINDOW_MS = 60_000;

let lastCallAt = 0;

async function space(): Promise<void> {
  const wait = lastCallAt + MIN_CALL_SPACING_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();
}

async function requestNewToken(): Promise<{ token: string; expiresAt: string }> {
  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const apiKey = process.env.HOSTAWAY_API_KEY;
  if (!accountId || !apiKey) {
    throw new Error('Missing HOSTAWAY_ACCOUNT_ID or HOSTAWAY_API_KEY');
  }

  const res = await fetch(`${BASE}/accessTokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: accountId,
      client_secret: apiKey,
      scope: 'general',
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Hostaway token request failed: HTTP ${res.status}`);

  const data = (await res.json()) as HostawayTokenResponse;
  if (!data.access_token) throw new Error('Hostaway token response missing access_token');
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { token: data.access_token, expiresAt };
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  const supabase = getSupabaseAdmin();

  if (!forceRefresh) {
    const { data } = await supabase
      .from('integration_tokens')
      .select('access_token, expires_at')
      .eq('provider', PROVIDER)
      .maybeSingle();
    if (
      data &&
      new Date(data.expires_at).getTime() - Date.now() > TOKEN_SAFETY_WINDOW_MS
    ) {
      return data.access_token;
    }
  }

  const { token, expiresAt } = await requestNewToken();
  const { error } = await supabase.from('integration_tokens').upsert({
    provider: PROVIDER,
    access_token: token,
    token_type: 'Bearer',
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    // A cache-write failure must not block the caller — the token is valid.
    console.error('integration_tokens upsert failed:', error.message);
  }
  return token;
}

async function hostawayGet<T>(path: string, isRetry = false): Promise<T> {
  await space();
  const token = await getAccessToken(isRetry);
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
    cache: 'no-store',
  });

  // 403 => token expired/invalid. Refresh once and retry.
  if (res.status === 403 && !isRetry) return hostawayGet<T>(path, true);
  if (!res.ok) throw new Error(`Hostaway GET ${path} failed: HTTP ${res.status}`);

  const body = (await res.json()) as HostawayResponse<T>;
  return body.result;
}

export function getListings(): Promise<HostawayListing[]> {
  return hostawayGet<HostawayListing[]>('/listings?limit=100');
}

export function getListing(id: number | string): Promise<HostawayListing> {
  return hostawayGet<HostawayListing>(`/listings/${id}`);
}

export function getListingCalendar(
  id: number | string,
  startDate: string,
  endDate: string,
): Promise<HostawayCalendarDay[]> {
  return hostawayGet<HostawayCalendarDay[]>(
    `/listings/${id}/calendar?startDate=${startDate}&endDate=${endDate}`,
  );
}
