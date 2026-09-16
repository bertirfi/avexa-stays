import { z } from 'zod';

/**
 * AVEXA Automation (CRM) — the guest's check-in link and door access code for
 * a reservation. Server-only: the Bearer secret must never reach the browser.
 *
 * GET https://crm.avexastays.com/api/public/trip?reservation=<hostaway id>
 * Not cached (the CRM answers no-store); called on every My Trips render and
 * while polling for the check-in email link. Unset MYTRIPS_API_SECRET = the
 * integration is off and every call answers `null`.
 */

const BASE = 'https://crm.avexastays.com/api/public/trip';
const TIMEOUT_MS = 5_000;

const tripSchema = z.object({
  reservation: z.object({
    active: z.boolean(),
    arrival_date: z.string(),
    departure_date: z.string(),
    listing: z.object({
      address: z.string().nullable().optional(),
    }),
  }),
  checkin: z
    .object({
      url: z.string().url(),
      completed: z.boolean(),
    })
    .nullable(),
  access: z.object({
    code: z.string().nullable(),
    valid_from: z.string().nullable(),
    valid_to: z.string().nullable(),
    available: z.boolean(),
    available_from: z.string().nullable(),
  }),
});

export type CrmTrip = z.infer<typeof tripSchema>;

export type CrmTripResult =
  | { kind: 'ok'; trip: CrmTrip }
  /** 404 — the reservation has not reached the CRM yet (webhook lag). */
  | { kind: 'pending' }
  /** Integration off, network/CRM error, or unexpected payload — show nothing. */
  | { kind: 'unavailable' };

export async function getCrmTrip(reservationId: number): Promise<CrmTripResult> {
  const secret = process.env.MYTRIPS_API_SECRET;
  // Mock reservations (HOSTAWAY_MOCK_RESERVATIONS) carry a negative id.
  if (!secret || reservationId <= 0) return { kind: 'unavailable' };

  try {
    const res = await fetch(`${BASE}?reservation=${reservationId}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 404) return { kind: 'pending' };
    if (!res.ok) {
      console.error(`[crm] trip ${reservationId}: HTTP ${res.status}`);
      return { kind: 'unavailable' };
    }
    const parsed = tripSchema.safeParse(await res.json());
    if (!parsed.success) {
      console.error(`[crm] trip ${reservationId}: unexpected payload`, parsed.error.issues);
      return { kind: 'unavailable' };
    }
    return { kind: 'ok', trip: parsed.data };
  } catch (err) {
    console.error(`[crm] trip ${reservationId} failed:`, err);
    return { kind: 'unavailable' };
  }
}

/** The CRM's check-in link for a reservation, or null while it doesn't exist yet. */
export async function getCrmCheckinUrl(reservationId: number): Promise<string | null> {
  const result = await getCrmTrip(reservationId);
  return result.kind === 'ok' ? (result.trip.checkin?.url ?? null) : null;
}
