import { NextResponse, after } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getListingCalendar } from '@/lib/hostaway/client';
import type { Database } from '@/types/database.types';

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
 *   `data` or at the top level, and log a compact PII-free summary line to
 *   calibrate against real deliveries.
 * - Always 200 fast (Hostaway may disable endpoints that keep failing); the
 *   actual work runs post-response in after(). Everything is idempotent:
 *   the availability upsert mirrors Hostaway truth and the booking-status
 *   reconcile only moves confirmed → cancelled.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_LOGIN = 'avexa';
const REFRESH_DAYS = 180;

type AvailabilityInsert = Database['public']['Tables']['availability']['Insert'];

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

/** Re-pull the affected listing's calendar and mirror it into the cache. */
async function refreshListingAvailability(listingMapId: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: prop } = await supabase
    .from('properties')
    .select('id')
    .eq('hostaway_listing_id', String(listingMapId))
    .maybeSingle();
  if (!prop) return; // a listing we don't sell on the site

  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + REFRESH_DAYS * 86_400_000).toISOString().slice(0, 10);
  const calendar = await getListingCalendar(listingMapId, start, end);

  const rows: AvailabilityInsert[] = calendar
    .filter((d) => Boolean(d.date))
    .map((d) => ({
      property_id: prop.id,
      date: d.date,
      available: d.isAvailable === 1 || d.status === 'available',
      price_ron: typeof d.price === 'number' && d.price > 0 ? d.price : 0,
      min_stay: d.minimumStay ?? 1,
    }));
  if (!rows.length) return;

  const { error } = await supabase
    .from('availability')
    .upsert(rows, { onConflict: 'property_id,date' });
  if (error) throw new Error(`availability upsert: ${error.message}`);

  const openPrices = rows.filter((r) => r.available && r.price_ron > 0).map((r) => r.price_ron);
  await supabase
    .from('properties')
    .update({
      price_from_ron: openPrices.length ? Math.min(...openPrices) : undefined,
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', prop.id);
}

/** If the event is one of OUR reservations being cancelled in the PMS, close the booking. */
async function reconcileBookingStatus(reservationId: number, status: string): Promise<void> {
  if (!/cancel/i.test(status)) return;
  const supabase = getSupabaseAdmin();
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('hostaway_reservation_id', String(reservationId))
    .neq('status', 'cancelled');
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

  // PII-free calibration line — shows the real delivery shape in the logs.
  console.log(
    '[hostaway-webhook]',
    JSON.stringify({
      object: parsed.data.object ?? null,
      event: parsed.data.event ?? null,
      keys: Object.keys(raw as Record<string, unknown>).slice(0, 12),
      reservationId: reservation?.id ?? null,
      listingMapId: reservation?.listingMapId ?? null,
      status: reservation?.status ?? null,
    }),
  );

  if (reservation?.listingMapId || reservation?.id) {
    after(async () => {
      try {
        if (reservation.listingMapId) {
          await refreshListingAvailability(reservation.listingMapId);
        }
        if (reservation.id && reservation.status) {
          await reconcileBookingStatus(reservation.id, reservation.status);
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
