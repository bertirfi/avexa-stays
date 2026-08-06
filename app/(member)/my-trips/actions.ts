'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cancelReservation } from '@/lib/hostaway/client';
import { cancellationConfirmedEmail, sendEmail } from '@/lib/email/brevo';
import { isFreeCancellable } from '@/lib/booking/cancellation';

export interface CancelBookingResult {
  ok: boolean;
  /** Machine error for the UI to translate; safe to show mapped copy for. */
  error?: 'not_found' | 'not_cancellable' | 'refund_failed';
}

const BookingIdSchema = z.string().uuid();

/**
 * Guest self-cancellation (Flexible rate, ≥48h before 15:00 check-in — the
 * PUBLISHED policy, re-checked server-side; the button's visibility is UI
 * convenience, never the gate).
 *
 * Money-safe ordering — the refund runs FIRST:
 *   1. Stripe full refund, idempotency-keyed on the booking id. A double
 *      click, a retry after a crash, or a concurrent submit all collapse onto
 *      the same refund — Stripe never pays out twice.
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
      'id, status, rate_plan, check_in, check_out, total_ron, guest_name, guest_email, hostaway_reservation_id, stripe_payment_intent_id',
    )
    .eq('id', parsed.data)
    .maybeSingle();
  if (!booking) return { ok: false, error: 'not_found' };

  if (!isFreeCancellable(booking) || !booking.stripe_payment_intent_id) {
    return { ok: false, error: 'not_cancellable' };
  }

  // 1 — Refund first. Idempotency key on the BOOKING id: every path that
  // cancels this booking converges on one single refund.
  try {
    await getStripe().refunds.create(
      { payment_intent: booking.stripe_payment_intent_id },
      { idempotencyKey: `cancel_${booking.id}` },
    );
  } catch (err) {
    console.error(
      `[cancel] CRITICAL — refund failed for booking ${booking.id}:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: 'refund_failed' };
  }

  // 2 — Close the booking (idempotent guard: only if still confirmed).
  const admin = getSupabaseAdmin();
  await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id)
    .eq('status', 'confirmed');

  // 3 — Cancel in the PMS. The unified webhook then frees the availability
  // cache. Best-effort: the guest already has their money back.
  try {
    await cancelReservation(booking.hostaway_reservation_id as string);
  } catch (err) {
    console.error(
      `[cancel] Hostaway cancel failed for reservation ${booking.hostaway_reservation_id}:`,
      err instanceof Error ? err.message : err,
    );
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
    });
  }

  // Guest notice — best-effort, never blocks the outcome.
  const notice = cancellationConfirmedEmail(booking);
  await sendEmail({ to: booking.guest_email, ...notice });

  revalidatePath('/my-trips');
  return { ok: true };
}
