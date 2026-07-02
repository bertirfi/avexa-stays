import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createReservation } from '@/lib/hostaway/client';
import type { HostawayFinanceField } from '@/lib/hostaway/types';
import { refundNoticeEmail, sendEmail } from '@/lib/email/resend';
import type { Database } from '@/types/database.types';

/**
 * Stripe webhook — the ONLY place a paid booking becomes a Hostaway
 * reservation. Payment never flows through Hostaway; this records the paid
 * booking (full RON total + offline "paid" charge + price-breakdown lines)
 * after Stripe confirms the charge.
 *
 * Contract:
 * - Node runtime + raw body (`req.text()`): signature verification hashes the
 *   exact bytes; `req.json()` would re-serialize and break the HMAC.
 * - Idempotent: Stripe delivers at-least-once. Fast-path dedupe via
 *   processed_stripe_events + the real lock: the booking row's status /
 *   hostaway_reservation_id checked before any side effect.
 * - forceOverbooking=0 + auto-refund: if Hostaway rejects (dates taken in the
 *   race window) or fails, the guest is refunded in full, the booking is
 *   cancelled, and the one app-sent email goes out. A premium brand never
 *   double-books (client decision 2026-07-02).
 */

export const runtime = 'nodejs';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

function reservationComment(booking: BookingRow, session: Stripe.Checkout.Session): string {
  // ALL reservation data goes to Hostaway — the client invoices from there.
  const extras = Array.isArray(booking.extras)
    ? (booking.extras as Array<{ name?: string; ron?: number }>)
        .map((e) => `${e.name ?? 'extra'}: ${e.ron ?? 0} RON`)
        .join('; ')
    : '';
  const lines = [
    'AVEXA direct booking (site, paid via Stripe)',
    `Rate plan: ${booking.rate_plan}`,
    `Accommodation: ${booking.accommodation_ron} RON`,
    extras ? `Extra services: ${extras} (total ${booking.extras_ron} RON)` : null,
    `City tax: ${booking.city_tax_ron} RON (10 RON/night/person)`,
    `TOTAL PAID: ${booking.total_ron} RON (VAT included)`,
    `Displayed to guest in ${booking.display_currency}${booking.display_fx_rate ? ` @ ${booking.display_fx_rate}` : ''}`,
    booking.invoice_company
      ? `Invoice: ${booking.invoice_company} · VAT ${booking.invoice_vat ?? '-'} · RegCom ${booking.invoice_reg_com ?? '-'} · ${booking.invoice_address ?? '-'}`
      : 'Invoice: individual',
    `Stripe session: ${session.id}`,
    `Booking id: ${booking.id} · Order: ${booking.order_id}`,
  ];
  return lines.filter(Boolean).join('\n');
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('webhook: STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error(
      'webhook: signature verification failed:',
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, ignored: 'unpaid' });
  }

  const admin = getSupabaseAdmin();

  // Fast-path dedupe (best-effort — the booking-row check below is the lock).
  const dedupe = await admin
    .from('processed_stripe_events')
    .insert({ event_id: event.id, type: event.type });
  if (dedupe.error && dedupe.error.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error('webhook: session has no bookingId metadata:', session.id);
    return NextResponse.json({ received: true, ignored: 'no_booking_ref' });
  }

  const { data: booking } = await admin
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking) {
    console.error('webhook: booking not found:', bookingId);
    return NextResponse.json({ received: true, ignored: 'booking_missing' });
  }

  // Real idempotency lock: already handled → done.
  if (booking.status === 'confirmed' || booking.hostaway_reservation_id) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ received: true, ignored: 'already_cancelled' });
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await admin
    .from('bookings')
    .update({ stripe_payment_intent_id: paymentIntentId })
    .eq('id', booking.id);

  try {
    const [firstName, ...rest] = booking.guest_name.trim().split(/\s+/);

    // Dashboard price-breakdown lines (client decision: city tax must show as
    // its own line, like channel reservations do). Totals must sum to totalPrice.
    const accommodationRon = Number(booking.accommodation_ron);
    const extrasRon = Number(booking.extras_ron);
    const cityTaxRon = Number(booking.city_tax_ron);
    const financeField: HostawayFinanceField[] = [
      {
        type: 'price',
        name: 'baseRate',
        title: 'Base rate',
        value: accommodationRon,
        total: accommodationRon,
        isIncludedInTotalPrice: 1,
        isOverriddenByUser: 1,
      },
      ...(extrasRon > 0
        ? [
            {
              type: 'fee',
              name: 'otherFees',
              title: 'Extra services',
              value: extrasRon,
              total: extrasRon,
              isIncludedInTotalPrice: 1,
              isOverriddenByUser: 1,
            } satisfies HostawayFinanceField,
          ]
        : []),
      {
        type: 'tax',
        name: 'cityTax',
        title: 'City / Tourism tax',
        value: cityTaxRon,
        total: cityTaxRon,
        isIncludedInTotalPrice: 1,
        isOverriddenByUser: 1,
      },
    ];

    const reservation = await createReservation({
      listingMapId: Number(session.metadata?.listingMapId),
      arrivalDate: booking.check_in,
      departureDate: booking.check_out,
      guestName: booking.guest_name,
      guestFirstName: firstName,
      guestLastName: rest.join(' ') || undefined,
      guestEmail: booking.guest_email,
      phone: booking.guest_phone ?? undefined,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      numberOfGuests: booking.adults + booking.children + booking.infants,
      totalPrice: Number(booking.total_ron),
      currency: 'RON',
      financeField,
      comment: reservationComment(booking, session),
    });

    await admin
      .from('bookings')
      .update({
        status: 'confirmed',
        hostaway_reservation_id: String(reservation.id),
      })
      .eq('id', booking.id);

    // Optimistic cache update so our own calendar blocks immediately
    // (the 15-min sync will reconcile with Hostaway's truth).
    await admin
      .from('availability')
      .update({ available: false })
      .eq('property_id', booking.property_id)
      .gte('date', booking.check_in)
      .lt('date', booking.check_out);

    return NextResponse.json({ received: true, reservation: reservation.id });
  } catch (err) {
    // Conflict or failure AFTER payment → full refund, never a double-booking.
    console.error(
      'webhook: reservation failed — refunding:',
      err instanceof Error ? err.message : err,
    );

    let refunded = false;
    if (paymentIntentId) {
      try {
        await getStripe().refunds.create(
          { payment_intent: paymentIntentId },
          { idempotencyKey: `refund_${session.id}` },
        );
        refunded = true;
      } catch (refundErr) {
        // Refund failed too — keep the event retryable so Stripe re-delivers
        // and we attempt again (idempotency keys make retries safe).
        console.error(
          'webhook: CRITICAL — refund failed, will retry via Stripe:',
          refundErr instanceof Error ? refundErr.message : refundErr,
        );
        return NextResponse.json({ error: 'refund_failed' }, { status: 500 });
      }
    }

    await admin
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);

    const notice = refundNoticeEmail(booking);
    await sendEmail({ to: booking.guest_email, ...notice });

    return NextResponse.json({ received: true, refunded });
  }
}
