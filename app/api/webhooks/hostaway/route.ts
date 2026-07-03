import { NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { syncListingAvailability } from '@/lib/hostaway/sync';

/**
 * Hostaway unified webhook — near-real-time availability. Hostaway pushes
 * reservation events for EVERY channel (Booking.com, Airbnb, direct, our
 * site), so the Supabase availability cache reflects an OTA booking within
 * seconds instead of waiting for the sync cron (client requirement:
 * sub-15-min gap). The cron stays as the reconciliation backstop.
 *
 * Contract:
 * - Auth: HTTP Basic (login "avexa" + HOSTAWAY_WEBHOOK_SECRET), set when the
 *   webhook is registered via POST /v1/webhooks/unifiedWebhooks. 401 otherwise.
 * - Tolerant payload parsing: Hostaway does not publicly document the exact
 *   delivery shape, so we accept the reservation object either nested under
 *   `data` or at the top level. A compact PII-free summary line can be enabled
 *   with HOSTAWAY_WEBHOOK_DEBUG=1 to calibrate against real deliveries.
 * - Always 200 fast (Hostaway may disable endpoints that keep failing); the
 *   actual work runs post-response in after(). Everything is idempotent:
 *   the availability upsert mirrors Hostaway truth and the booking-status
 *   reconcile only moves confirmed → cancelled.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_LOGIN = 'avexa';

function isAuthorized(request: Request): boolean {
  const secret = process.env.HOSTAWAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const expected = Buffer.from(`${WEBHOOK_LOGIN}:${secret}`);
  const received = Buffer.from(decoded);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Reservation fields we act on — everything else passes through untouched. */
const ReservationShapeSchema = z
  .object({
    id: z.number().optional(),
    listingMapId: z.number().optional(),
    status: z.string().nullish(),
    arrivalDate: z.string().nullish(),
    departureDate: z.string().nullish(),
  })
  .passthrough();

const BodySchema = z
  .object({
    object: z.string().nullish(),
    event: z.string().nullish(),
    data: ReservationShapeSchema.nullish(),
  })
  .passthrough();

/**
 * Re-pull the affected listing's calendar and mirror it into the cache via the
 * shared helper (identical behaviour to the sync cron). Returns the property_id
 * it refreshed so the cancellation path can skip re-syncing the same listing.
 */
async function refreshListingAvailability(listingMapId: number): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: prop } = await supabase
    .from('properties')
    .select('id')
    .eq('hostaway_listing_id', String(listingMapId))
    .maybeSingle();
  if (!prop) return null; // a listing we don't sell on the site

  await syncListingAvailability({ propertyId: prop.id, listingMapId });
  return prop.id;
}

/**
 * If the event is one of OUR reservations being cancelled in the PMS, close the
 * booking AND free the cache — even when the payload carried no listingMapId.
 * Resolves the booking's property → that property's Hostaway listing → sync.
 * `alreadySyncedPropertyId` lets the caller avoid a second sync when the
 * listingMapId path already refreshed this same property in this request.
 */
async function reconcileBookingStatus(
  reservationId: number,
  status: string,
  alreadySyncedPropertyId: string | null,
): Promise<void> {
  if (!/cancel/i.test(status)) return;
  const supabase = getSupabaseAdmin();

  // Flip the booking first (idempotent: only confirmed/pending → cancelled).
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('hostaway_reservation_id', String(reservationId))
    .neq('status', 'cancelled')
    .select('property_id')
    .maybeSingle();
  if (!booking) return; // not one of ours, or already cancelled

  // Free the calendar even without a listingMapId in the payload — resolve the
  // listing from the booking's property. Best-effort: never block the cancel.
  if (booking.property_id === alreadySyncedPropertyId) return; // already refreshed
  try {
    const { data: prop } = await supabase
      .from('properties')
      .select('hostaway_listing_id')
      .eq('id', booking.property_id)
      .maybeSingle();
    if (prop?.hostaway_listing_id) {
      await syncListingAvailability({
        propertyId: booking.property_id,
        listingMapId: Number(prop.hostaway_listing_id),
      });
    }
  } catch (err) {
    console.error(
      '[hostaway-webhook] cache-free after cancel failed:',
      err instanceof Error ? err.message : err,
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // The reservation object arrives nested under `data` or as the body itself.
  const nested = parsed.data.data;
  const flat = ReservationShapeSchema.safeParse(raw);
  const reservation = nested ?? (flat.success ? flat.data : null);

  // Bounded PII-free line, gated behind HOSTAWAY_WEBHOOK_DEBUG=1 (only enabled
  // while calibrating against real deliveries) — primitives only, no raw keys.
  if (process.env.HOSTAWAY_WEBHOOK_DEBUG === '1') {
    console.log(
      '[hostaway-webhook]',
      JSON.stringify({
        event: parsed.data.event ?? null,
        reservationId: reservation?.id ?? null,
        listingMapId: reservation?.listingMapId ?? null,
        status: reservation?.status ?? null,
      }),
    );
  }

  if (reservation?.listingMapId || reservation?.id) {
    after(async () => {
      try {
        // Track which property the listingMapId path already refreshed so the
        // cancellation path below does not sync the same listing twice.
        let syncedPropertyId: string | null = null;
        if (reservation.listingMapId) {
          syncedPropertyId = await refreshListingAvailability(reservation.listingMapId);
        }
        if (reservation.id && reservation.status) {
          await reconcileBookingStatus(reservation.id, reservation.status, syncedPropertyId);
        }
      } catch (err) {
        console.error(
          '[hostaway-webhook] processing failed:',
          err instanceof Error ? err.message : err,
        );
      }
    });
  }

  return NextResponse.json({ received: true });
}
