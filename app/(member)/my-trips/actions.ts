'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cancelReservation } from '@/lib/hostaway/client';
import { cancellationConfirmedEmail, sendEmail } from '@/lib/email/brevo';
import { isSelfCancellable, refundPercentFor } from '@/lib/booking/cancellation';
import { revokeEarnForBooking } from '@/lib/avx/ledger';
import {
  EXTRA_IDS,
  extraPriceRon,
  extrasStillBookable,
  getExtra,
  roomsForCleaning,
  type BookingExtra,
} from '@/lib/extras';
import { properties } from '@/lib/properties';

export interface CancelBookingResult {
  ok: boolean;
  /** Machine error for the UI to translate; safe to show mapped copy for. */
  error?: 'not_found' | 'not_cancellable' | 'refund_failed';
}

const BookingIdSchema = z.string().uuid();

/**
 * Guest self-cancellation — tiered policy (DX7 / M1.3), re-checked server-side;
 * the button's visibility is UI convenience, never the gate.
 *   refund = city tax × 100% (always) + (total − city tax) × tier (100/50/0).
 *
 * Money-safe ordering — the refund runs FIRST:
 *   1. Stripe refund (full or partial via `amount`), idempotency-keyed on the
 *      booking id. A double click, a retry after a crash, or a concurrent
 *      submit all collapse onto the same refund — Stripe never pays out twice.
 *   2. Booking row → cancelled (the calendar frees via webhook/sync).
 *   3. Hostaway cancel — best-effort: money is already back with the guest,
 *      so a PMS failure alerts ops instead of failing the guest.
 * A crash between 1 and 2 self-heals: the booking stays confirmed, the guest
 * retries, the idempotent refund no-ops and the flow completes.
 */
export async function cancelBooking(bookingId: string): Promise<CancelBookingResult> {
  const parsed = BookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { ok: false, error: 'not_found' };

  // Identity from the validated Supabase session; the session-scoped client's
  // RLS (bookings_select_own) makes this read ownership-proof by construction.
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_found' };

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      'id, status, check_in, check_out, total_ron, city_tax_ron, guest_name, guest_email, hostaway_reservation_id, stripe_payment_intent_id, extras',
    )
    .eq('id', parsed.data)
    .maybeSingle();
  if (!booking) return { ok: false, error: 'not_found' };

  if (!isSelfCancellable(booking) || !booking.stripe_payment_intent_id) {
    return { ok: false, error: 'not_cancellable' };
  }

  // Tier at THIS moment (server clock — the UI label is convenience only).
  // City tax is ALWAYS refunded in full; the tier grades the remainder.
  const pct = refundPercentFor(booking.check_in);
  // Extras bought AFTER booking sit on their own Stripe charges (My Trips
  // add-ons, entries carrying paymentIntentId) — they are not part of the
  // original charge, so the tiered refund is computed on the stay only.
  const addons = (Array.isArray(booking.extras) ? (booking.extras as BookingExtra[]) : []).filter(
    (e): e is BookingExtra & { paymentIntentId: string } => typeof e.paymentIntentId === 'string',
  );
  const addonRon = addons.reduce((sum, e) => sum + Number(e.ron), 0);
  const totalRon = Number(booking.total_ron) - addonRon;
  const cityTaxRon = Number(booking.city_tax_ron);
  const refundRon = Math.round(cityTaxRon + ((totalRon - cityTaxRon) * pct) / 100);
  if (refundRon <= 0) return { ok: false, error: 'not_cancellable' };

  // 1 — Refund first. Idempotency key on the BOOKING id: every path that
  // cancels this booking converges on one single refund. Partial (50%) tiers
  // pass an explicit amount in bani; the 100% tier refunds the full charge.
  try {
    await getStripe().refunds.create(
      {
        payment_intent: booking.stripe_payment_intent_id,
        ...(refundRon < totalRon ? { amount: refundRon * 100 } : {}),
      },
      // ponytail: a retry that crosses the 72h→24h tier boundary reuses this key
      // with a different amount — Stripe rejects it (idempotency conflict), so
      // the rare race surfaces refund_failed rather than a double/mixed refund.
      { idempotencyKey: `cancel_${booking.id}` },
    );
    console.log(
      `[cancel] booking ${booking.id} self-cancelled by user ${user.id} at ${new Date().toISOString()} — tier ${pct}%, refunded ${refundRon} RON of ${totalRon} RON (city tax ${cityTaxRon} RON in full)`,
    );
  } catch (err) {
    console.error(
      `[cancel] CRITICAL — refund failed for booking ${booking.id}:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: 'refund_failed' };
  }

  // Add-ons follow AVX-08 §6: free to cancel up to their lead time, charged in
  // full after it. One refund per add-on charge, idempotent per booking + PI.
  const bookable = new Set<string>(extrasStillBookable(booking.check_in).map((e) => e.id));
  const byPi = new Map<string, BookingExtra[]>();
  for (const e of addons) byPi.set(e.paymentIntentId, [...(byPi.get(e.paymentIntentId) ?? []), e]);
  for (const [pi, lines] of byPi) {
    const refundable = lines.filter((e) => bookable.has(e.id));
    const amount = refundable.reduce((sum, e) => sum + Number(e.ron), 0);
    if (amount <= 0) continue;
    try {
      await getStripe().refunds.create(
        {
          payment_intent: pi,
          ...(refundable.length < lines.length ? { amount: Math.round(amount * 100) } : {}),
        },
        { idempotencyKey: `cancel_${booking.id}_${pi}` },
      );
    } catch (err) {
      // Stay refund already done — never fail the guest here; ops resolve it.
      console.error(`[cancel] add-on refund failed for booking ${booking.id} PI ${pi}:`, err);
      await sendEmail({
        to: 'office@avexastays.com',
        subject: `MANUAL REFUND NEEDED — extras on cancelled booking ${booking.id}`,
        html: `<p>Refund ${amount} RON on Stripe PaymentIntent ${pi} (extras: ${refundable.map((e) => e.name).join(', ')}).</p>`,
      });
    }
  }

  // 2 — Close the booking (idempotent guard: only if still confirmed).
  const admin = getSupabaseAdmin();
  await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id)
    .eq('status', 'confirmed');
  // A cancelled stay earns nothing — void the pending AVX tranche.
  await revokeEarnForBooking(booking.id);

  // 3 — Cancel in the PMS. The unified webhook then frees the availability
  // cache. Best-effort: the guest already has their money back.
  try {
    await cancelReservation(booking.hostaway_reservation_id as string);
  } catch (err) {
    console.error(
      `[cancel] Hostaway cancel failed for reservation ${booking.hostaway_reservation_id}:`,
      err instanceof Error ? err.message : err,
    );
    // Best-effort too: the guest is refunded and cancelled — an email failure
    // must not surface as an error to them.
    await sendEmail({
      to: 'office@avexastays.com',
      subject: `[OPS] Cancel in Hostaway manually — reservation ${booking.hostaway_reservation_id}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6">
          <p>A guest self-cancelled booking <strong>${booking.id}</strong>
          (${booking.check_in} → ${booking.check_out}) and the Stripe refund is done,
          but cancelling Hostaway reservation
          <strong>${booking.hostaway_reservation_id}</strong> failed.</p>
          <p>Please cancel it in Hostaway so the calendar frees.</p>
        </div>
      `,
    }).catch((e: unknown) => console.error('[cancel] ops email failed:', e));
  }

  // Guest notice — best-effort, never blocks the outcome.
  const notice = cancellationConfirmedEmail({ ...booking, refund_ron: refundRon, refund_percent: pct });
  await sendEmail({ to: booking.guest_email, ...notice });

  revalidatePath('/my-trips');
  return { ok: true };
}

export interface StartExtrasCheckoutResult {
  ok: true;
  url: string;
}
export interface StartExtrasCheckoutError {
  ok: false;
  error: string;
}

const ExtraIdsSchema = z.array(z.enum(EXTRA_IDS)).min(1).max(10);

/**
 * Add-on purchase after booking (My Trips). Re-derives every price from the
 * catalogue + property server-side (never trusts a client amount) and opens
 * a Stripe Checkout Session; the webhook (kind:'extras' branch) appends the
 * paid items to `bookings.extras` once payment completes.
 */
export async function startExtrasCheckout(
  bookingId: string,
  extraIds: string[],
): Promise<StartExtrasCheckoutResult | StartExtrasCheckoutError> {
  const idParse = z.string().uuid().safeParse(bookingId);
  if (!idParse.success) return { ok: false, error: 'not_found' };
  const idsParse = ExtraIdsSchema.safeParse(extraIds);
  if (!idsParse.success) return { ok: false, error: 'invalid_extras' };
  const ids = Array.from(new Set(idsParse.data));

  // Identity from the validated Supabase session — never a client-supplied id.
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_found' };

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, property_id, check_in, check_out, guest_name, guest_email, extras')
    .eq('id', idParse.data)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!booking) return { ok: false, error: 'not_found' };
  if (booking.status !== 'confirmed') return { ok: false, error: 'not_bookable' };

  const todayYmd = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
  if (booking.check_out < todayYmd) return { ok: false, error: 'not_bookable' };

  const bookable = new Set(extrasStillBookable(booking.check_in).map((e) => e.id));
  if (ids.some((id) => !bookable.has(id))) return { ok: false, error: 'lead_time_passed' };

  const existingIds = new Set(
    Array.isArray(booking.extras)
      ? (booking.extras as Array<{ id?: string }>).map((e) => e.id).filter(Boolean)
      : [],
  );
  if (ids.some((id) => existingIds.has(id))) return { ok: false, error: 'already_added' };

  const property = properties.find((p) => p.id === booking.property_id);
  if (!property) return { ok: false, error: 'not_found' };
  const rooms = roomsForCleaning(property.cleaningRon);

  const items = ids.map((id) => {
    const extra = getExtra(id);
    if (!extra) throw new Error(`unknown extra id: ${id}`);
    return { id: extra.id, name: extra.name, ron: extraPriceRon(extra, rooms) };
  });

  // Origin, hardened against Host-header spoofing (mirrors app/api/checkout).
  const fallback = 'https://avexastays.com';
  let origin = fallback;
  try {
    const h = await headers();
    const host = h.get('host') ?? '';
    const allowed =
      host === 'avexastays.com' ||
      host === 'www.avexastays.com' ||
      host.startsWith('localhost') ||
      host.endsWith('.vercel.app');
    origin = allowed ? `https://${host}` : fallback;
    if (host.startsWith('localhost')) origin = `http://${host}`;
  } catch {
    origin = fallback;
  }

  const stayDescription = `${property.name} · ${booking.check_in} → ${booking.check_out}`;

  try {
    // ponytail: no idempotency key — unlike /api/checkout this action has no
    // persisted "pending" row to dedupe against, and a same-ids double click
    // just opens a second session; the webhook's sessionId-in-extras check
    // still stops a double-paid session from being applied twice.
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: 'ron',
          unit_amount: Math.round(item.ron * 100),
          product_data: {
            name: `Extra service — ${item.name}`,
            description: stayDescription,
          },
        },
      })),
      success_url: `${origin}/my-trips?extras=added`,
      cancel_url: `${origin}/my-trips`,
      customer_email: booking.guest_email,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: {
        kind: 'extras',
        bookingId: booking.id,
        extraIds: ids.join(','),
      },
    });
    if (!session.url) throw new Error('session has no url');
    return { ok: true, url: session.url };
  } catch (err) {
    console.error(
      '[startExtrasCheckout] session creation failed:',
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: 'payment_init_failed' };
  }
}
