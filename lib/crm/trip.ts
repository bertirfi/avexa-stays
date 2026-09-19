import { z } from 'zod';

/**
 * AVEXA Automation (CRM) — the guest's check-in link and door access code for
 * a reservation. Server-only: the Bearer secret must never reach the browser.
 *
 * GET https://crm.avexastays.com/api/public/trip?reservation=<hostaway id>
 * Not cached (the CRM answers no-store); called on every My Trips render.
 * Unset MYTRIPS_API_SECRET = the integration is off and every call answers
 * `unavailable`. The CRM also owns the guest emails for direct reservations
 * (since 19.09) — the site only reads.
 */

const BASE = 'https://crm.avexastays.com/api/public/trip';
const TIMEOUT_MS = 5_000;

const tripSchema = z.object({
  reservation: z.object({
    active: z.boolean(),
    /** Booked on the site / by phone (true) vs OTA (false). The card is direct-only. */
    direct: z.boolean().default(false),
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
      /**
       * Whether the link actually opens for this guest. Before the CRM go-live
       * it is true only for test guests; after go-live for everyone. The card
       * is shown only when true — nothing to change on the site at go-live.
       */
      active: z.boolean().default(false),
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
