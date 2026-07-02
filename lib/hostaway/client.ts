import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  HostawayCalendarDay,
  HostawayCreateReservationInput,
  HostawayListing,
  HostawayReservation,
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

/** Thrown on non-2xx Hostaway responses so callers can act on the detail. */
export class HostawayApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = 'HostawayApiError';
  }
}

async function hostawayPost<T>(
  path: string,
  payload: unknown,
  isRetry = false,
): Promise<T> {
  await space();
  const token = await getAccessToken(isRetry);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  // 403 => token expired/invalid. Refresh once and retry.
  if (res.status === 403 && !isRetry) return hostawayPost<T>(path, payload, true);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HostawayApiError(
      `Hostaway POST ${path} failed: HTTP ${res.status}`,
      res.status,
      body.slice(0, 2000),
    );
  }

  const body = (await res.json()) as HostawayResponse<T>;
  return body.result;
}

// Hostaway reservation channel for our own direct-site bookings.
const DIRECT_CHANNEL_ID = 2000;
// Shows as the reservation `source` in the Hostaway dashboard.
const RESERVATION_PROVIDER = 'avexastays';

/**
 * Create a reservation after a successful Stripe payment. Payment NEVER flows
 * through Hostaway — this only records the paid booking (full RON total plus
 * an offline "paid" charge so paymentStatus reads "Paid") so the calendar
 * blocks and the client can invoice from Hostaway with nothing left to
 * collect.
 *
 * forceOverbooking=0 (deliberate): if the dates were taken in the race window,
 * Hostaway rejects and the webhook refunds the guest — a premium brand never
 * double-books. Idempotency is OURS (Hostaway has none): callers must check
 * the booking row's hostaway_reservation_id before calling.
 *
 * HOSTAWAY_MOCK_RESERVATIONS=1 short-circuits with a fake reservation so the
 * full checkout flow can be tested without touching the real PMS.
 */
export async function createReservation(
  input: HostawayCreateReservationInput,
): Promise<HostawayReservation> {
  if (process.env.HOSTAWAY_MOCK_RESERVATIONS === '1') {
    console.warn(
      '[hostaway] MOCK reservation (HOSTAWAY_MOCK_RESERVATIONS=1) — real PMS not called',
    );
    return {
      id: -Math.floor(1 + Math.random() * 1_000_000_000), // negative = unmistakably fake
      listingMapId: input.listingMapId,
      channelId: DIRECT_CHANNEL_ID,
      arrivalDate: input.arrivalDate,
      departureDate: input.departureDate,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      totalPrice: input.totalPrice,
      currency: input.currency,
      status: 'new',
      confirmationCode: 'MOCK',
    };
  }

  const reservation = await hostawayPost<HostawayReservation>(
    `/reservations?forceOverbooking=0&provider=${RESERVATION_PROVIDER}`,
    {
      channelId: DIRECT_CHANNEL_ID,
      ...input,
      isPaid: 1, // Hostaway convention: booleans as 0/1 integers
      status: 'new',
    },
  );

  // Hostaway ignores isPaid on both POST and PUT (verified 2026-07-02:
  // reservations kept paymentStatus "Unknown", leaving the PMS showing a
  // balance due and blocking charge automations). Payment state is derived
  // from guest-payment charge records, so record one offline charge for the
  // full collected amount. paymentMethod "other": "stripe" is reserved for
  // charges made through Hostaway's own connected gateway and 500s here.
  // Best-effort: the reservation already exists and blocks the calendar, so
  // a failure here must never fail the booking.
  try {
    await hostawayPost<unknown>(`/guestPayments/charges/${reservation.id}`, {
      title: 'Paid via Stripe on avexastays.com',
      description: `Collected in full by the AVEXA website Stripe checkout: ${input.totalPrice} ${input.currency}.`,
      amount: input.totalPrice,
      paymentMethod: 'other',
      status: 'paid',
      scheduledDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
  } catch (err) {
    console.warn(
      `[hostaway] offline paid-charge failed for reservation ${reservation.id} — PMS will show a balance due`,
      err,
    );
  }

  return reservation;
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
