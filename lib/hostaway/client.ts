import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/brevo';
import type {
  HostawayCalendarDay,
  HostawayConversation,
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
const MAX_429_RETRIES = 2; // beyond the initial attempt
const DEFAULT_429_BACKOFF_MS = [2_000, 4_000]; // when Retry-After is absent
const RETRY_AFTER_CAP_MS = 10_000;

let lastCallAt = 0;
// Collapses concurrent refreshes in THIS instance onto one token request.
// Cross-instance races remain possible but are harmless: both tokens are
// valid — Hostaway does not revoke a prior token when it issues a new one.
let inFlightToken: Promise<string> | null = null;

async function space(): Promise<void> {
  const wait = lastCallAt + MIN_CALL_SPACING_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * How long to wait before a 429 retry: the server's Retry-After (seconds,
 * capped at 10s) when present, else exponential 2s → 4s by attempt index.
 */
function backoffForAttempt(res: Response, attempt: number): number {
  const header = res.headers.get('retry-after');
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, RETRY_AFTER_CAP_MS);
    }
  }
  return DEFAULT_429_BACKOFF_MS[Math.min(attempt, DEFAULT_429_BACKOFF_MS.length - 1)];
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

/** Request a fresh token and cache it. Single-flighted by getAccessToken. */
async function refreshAccessToken(): Promise<string> {
  const supabase = getSupabaseAdmin();
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

  // Single-flight: concurrent callers in this instance await the same refresh.
  if (!inFlightToken) {
    inFlightToken = refreshAccessToken().finally(() => {
      inFlightToken = null;
    });
  }
  return inFlightToken;
}

async function hostawayGet<T>(path: string, isRetry = false): Promise<T> {
  // 429 handling is orthogonal to the 403-refresh: retry up to MAX_429_RETRIES
  // times, backing off per Retry-After (else exponential), then give up.
  for (let attempt = 0; ; attempt += 1) {
    await space();
    const token = await getAccessToken(isRetry);
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    // 403 => token expired/invalid. Refresh once and retry.
    if (res.status === 403 && !isRetry) return hostawayGet<T>(path, true);
    if (res.status === 429 && attempt < MAX_429_RETRIES) {
      await sleep(backoffForAttempt(res, attempt));
      continue;
    }
    if (!res.ok) throw new Error(`Hostaway GET ${path} failed: HTTP ${res.status}`);

    const body = (await res.json()) as HostawayResponse<T>;
    return body.result;
  }
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

/**
 * The create POST returned 2xx but the response could not be parsed into a
 * reservation with a numeric id — so the reservation MAY exist in the PMS.
 * The caller must NOT blindly refund: it should first try to adopt the
 * possibly-orphaned reservation (see findRecentDirectReservation).
 */
export class HostawayAmbiguousCreateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HostawayAmbiguousCreateError';
  }
}

async function hostawayPost<T>(
  path: string,
  payload: unknown,
  isRetry = false,
): Promise<T> {
  // 429 handling mirrors hostawayGet and stays independent of the 403-refresh.
  for (let attempt = 0; ; attempt += 1) {
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
    if (res.status === 429 && attempt < MAX_429_RETRIES) {
      await sleep(backoffForAttempt(res, attempt));
      continue;
    }
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
}

async function hostawayDelete<T>(path: string, isRetry = false): Promise<T> {
  // Mirrors hostawayPost: 429 backoff independent of the one-shot 403 refresh.
  for (let attempt = 0; ; attempt += 1) {
    await space();
    const token = await getAccessToken(isRetry);
    const res = await fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    if (res.status === 403 && !isRetry) return hostawayDelete<T>(path, true);
    if (res.status === 429 && attempt < MAX_429_RETRIES) {
      await sleep(backoffForAttempt(res, attempt));
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HostawayApiError(
        `Hostaway DELETE ${path} failed: HTTP ${res.status}`,
        res.status,
        body.slice(0, 2000),
      );
    }

    const body = (await res.json()) as HostawayResponse<T>;
    return body.result;
  }
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
      // Explicit whitelist of the create payload (no `...input` spread) so a
      // future field added to HostawayCreateReservationInput can't silently
      // leak into the PMS call — every field sent to Hostaway is listed here.
      listingMapId: input.listingMapId,
      arrivalDate: input.arrivalDate,
      departureDate: input.departureDate,
      guestName: input.guestName,
      guestFirstName: input.guestFirstName,
      guestLastName: input.guestLastName,
      guestEmail: input.guestEmail,
      phone: input.phone,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      numberOfGuests: input.numberOfGuests,
      totalPrice: input.totalPrice,
      currency: input.currency,
      financeField: input.financeField,
      comment: input.comment,
      isPaid: 1, // Hostaway convention: booleans as 0/1 integers
      status: 'new',
    },
  );

  // The POST returned 2xx — but if the body did not parse into a reservation
  // with a numeric id we cannot trust it, and the reservation MAY still exist.
  // Signal ambiguity so the caller adopts instead of blindly refunding.
  if (!reservation || typeof reservation.id !== 'number') {
    throw new HostawayAmbiguousCreateError(
      'create POST returned 2xx but the response was unparseable — the reservation MAY exist in the PMS',
    );
  }

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
    console.error(
      `[hostaway] offline paid-charge failed for reservation ${reservation.id} — PMS will show a balance due`,
      err,
    );
    // Best-effort ops alert so the team can add the charge by hand. Stripe
    // already collected the money; this failure only affects the PMS display.
    // Its own try/catch — an email failure must never fail the booking.
    try {
      await sendEmail({
        to: 'office@avexastays.com',
        subject: `[OPS] Hostaway shows balance due — reservation ${reservation.id}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6">
            <p>The offline "paid" charge could not be recorded for Hostaway
            reservation <strong>${reservation.id}</strong>, so the PMS shows a
            balance due.</p>
            <p>Amount already collected via Stripe:
            <strong>${input.totalPrice} ${input.currency}</strong>.</p>
            <p>Stripe has already collected the money in full — please add the
            offline charge to this reservation manually in Hostaway so the
            balance clears.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error(
        `[hostaway] ops alert email failed for reservation ${reservation.id}`,
        mailErr,
      );
    }
  }

  return reservation;
}

export function getReservation(id: number | string): Promise<HostawayReservation> {
  return hostawayGet<HostawayReservation>(`/reservations/${id}`);
}

/**
 * Cancel a reservation in the PMS (Hostaway keeps the record, status becomes
 * cancelled; the calendar frees and the unified webhook fires). Idempotent for
 * callers: cancelling an already-cancelled/deleted reservation returns cleanly
 * instead of throwing, so a retried cancel flow never fails on this step.
 */
export async function cancelReservation(id: number | string): Promise<void> {
  if (process.env.HOSTAWAY_MOCK_RESERVATIONS === '1') {
    console.warn('[hostaway] MOCK cancel (HOSTAWAY_MOCK_RESERVATIONS=1) — real PMS not called');
    return;
  }
  try {
    await hostawayDelete<unknown>(`/reservations/${id}`);
  } catch (err) {
    if (
      err instanceof HostawayApiError &&
      (err.status === 404 || /cancel/i.test(err.body))
    ) {
      return; // already gone or already cancelled — the goal state
    }
    throw err;
  }
}

/**
 * Find a direct-site reservation that may already exist in the PMS for these
 * exact dates + guest — used to ADOPT a possibly-orphaned reservation after an
 * ambiguous create (2xx but unparseable, or a network reset after the POST
 * landed) instead of refunding a guest whose reservation is silently blocking
 * the calendar.
 *
 * The list endpoint returns an array in `result`. We narrow client-side to our
 * own channel (2000), an exact arrival/departure match, a case-insensitive
 * guest-email match, and a non-cancelled status, then return the newest match.
 * Never throws: any failure yields null so the caller falls back to refunding.
 */
export async function findRecentDirectReservation(input: {
  listingMapId: number;
  arrivalDate: string;
  departureDate: string;
  guestEmail: string;
}): Promise<HostawayReservation | null> {
  try {
    const list = await hostawayGet<HostawayReservation[]>(
      `/reservations?listingId=${input.listingMapId}` +
        `&arrivalStartDate=${input.arrivalDate}&arrivalEndDate=${input.arrivalDate}`,
    );
    if (!Array.isArray(list)) return null;

    const wantedEmail = input.guestEmail.trim().toLowerCase();
    const matches = list.filter(
      (r) =>
        r.channelId === DIRECT_CHANNEL_ID &&
        r.arrivalDate === input.arrivalDate &&
        r.departureDate === input.departureDate &&
        (r.guestEmail ?? '').trim().toLowerCase() === wantedEmail &&
        !/cancel/i.test(r.status ?? ''),
    );
    if (!matches.length) return null;

    // Newest first: prefer the highest id (Hostaway ids increase monotonically).
    matches.sort((a, b) => b.id - a.id);
    return matches[0];
  } catch {
    return null;
  }
}

export function getReservationConversations(
  reservationId: number | string,
): Promise<HostawayConversation[]> {
  return hostawayGet<HostawayConversation[]>(`/conversations?reservationId=${reservationId}`);
}

/**
 * Send a message on a reservation's guest conversation. communicationType
 * "email" (the default) makes Hostaway email the guest AND keeps the message
 * visible in the Hostaway inbox — the client's team sees it and any replies.
 */
export function sendConversationMessage(
  conversationId: number,
  body: string,
): Promise<unknown> {
  return hostawayPost<unknown>(`/conversations/${conversationId}/messages`, {
    body,
    communicationType: 'email',
  });
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
