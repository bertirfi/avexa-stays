import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { quoteBooking } from '@/lib/booking/quote';
import { CheckoutBodySchema } from '@/lib/booking/schema';
import { getDisplayRates } from '@/lib/pricing';

/**
 * Creates a Stripe Checkout Session for a booking.
 *
 * Trust boundary (api-validation + pricing rules):
 * - Identity comes from the Supabase session — never from the client body.
 * - The client sends ONLY ids/dates/guests/contact. The price is re-derived
 *   server-side from a live Hostaway read (lib/booking/quote) — any client
 *   total is ignored by design.
 * - Charged in RON (money of record); the session line items mirror the
 *   guest-facing breakdown: accommodation → extras → city tax.
 */

export const runtime = 'nodejs';

const RATE_PLAN: Record<'saver' | 'flex', 'non_refundable' | 'flexible'> = {
  saver: 'non_refundable',
  flex: 'flexible',
};

/**
 * The origin used to build Stripe's success/cancel URLs, hardened against
 * Host-header spoofing: a forged Host must not steer Stripe's post-payment
 * redirect off to an attacker's site. Accept only our own hostnames (prod,
 * localhost on any port, and Vercel preview `*.vercel.app`); anything else
 * falls back to the canonical production origin.
 */
function trustedOrigin(req: Request): string {
  const fallback = 'https://avexastays.com';
  try {
    const { origin, hostname } = new URL(req.url);
    const allowed =
      hostname === 'avexastays.com' ||
      hostname === 'www.avexastays.com' ||
      hostname === 'localhost' ||
      hostname.endsWith('.vercel.app');
    return allowed ? origin : fallback;
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  // 1 — Identity from the validated Supabase session (members only).
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  // 2 — Validate input (ids/dates/guests/contact only — never money).
  // Shared schema with /api/quote so the previewed price and the charge are
  // derived from an identical input contract (lib/booking/schema).
  let body: z.infer<typeof CheckoutBodySchema>;
  try {
    body = CheckoutBodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // 3 — Server-side quote from live Hostaway (the ONLY price source).
  const quote = await quoteBooking({
    propertyId: body.propertyId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    adults: body.adults,
    children: body.children,
    infants: body.infants,
    rateId: body.rateId,
    breakfast: body.breakfast,
  });
  if (!quote.ok) {
    const status = quote.reason === 'unavailable' ? 409 : 400;
    return NextResponse.json({ error: quote.reason }, { status });
  }

  const admin = getSupabaseAdmin();
  const rates = getDisplayRates();
  const displayFxRate =
    body.displayCurrency === 'RON' ? null : rates[body.displayCurrency];

  // 3b — Supersede any stale pending rows for the SAME stay by this user.
  // Repeat Pay clicks / back-button retries must not pile up pending bookings
  // or leave live Stripe sessions open: expire each old session (best-effort),
  // then mark the row cancelled before creating the fresh one.
  const { data: stalePendings } = await admin
    .from('bookings')
    .select('id, stripe_session_id')
    .eq('user_id', user.id)
    .eq('property_id', quote.propertyId)
    .eq('check_in', quote.checkIn)
    .eq('check_out', quote.checkOut)
    .eq('status', 'pending');
  for (const stale of stalePendings ?? []) {
    if (stale.stripe_session_id) {
      // A session already PAID (e.g. in another tab) must never be superseded:
      // cancelling its row would make the Stripe webhook ignore the payment —
      // money kept with no reservation and no refund. Let its webhook finish.
      try {
        const staleSession = await getStripe().checkout.sessions.retrieve(
          stale.stripe_session_id,
        );
        if (staleSession.payment_status === 'paid') {
          return NextResponse.json({ error: 'already_processing' }, { status: 409 });
        }
      } catch {
        // Can't inspect the session — leave this row untouched rather than
        // risk superseding a payment we cannot see.
        continue;
      }
      try {
        await getStripe().checkout.sessions.expire(stale.stripe_session_id);
      } catch {
        // expire() throws if the session completed in the tiny window since the
        // paid-check above. Re-read: if it is now paid, DON'T cancel the row —
        // let its webhook confirm/refund. Otherwise it was genuinely expired.
        try {
          const recheck = await getStripe().checkout.sessions.retrieve(
            stale.stripe_session_id,
          );
          if (recheck.payment_status === 'paid') {
            return NextResponse.json({ error: 'already_processing' }, { status: 409 });
          }
        } catch {
          continue; // Can't inspect → never risk superseding a possible payment.
        }
      }
    }
    await admin.from('bookings').update({ status: 'cancelled' }).eq('id', stale.id);
  }

  // 4 — Persist the pending booking (service-role; RLS has no client write path).
  const { data: booking, error: insertError } = await admin
    .from('bookings')
    .insert({
      order_id: crypto.randomUUID(),
      user_id: user.id,
      property_id: quote.propertyId,
      check_in: quote.checkIn,
      check_out: quote.checkOut,
      guests: quote.occupants,
      adults: quote.adults,
      children: quote.children,
      infants: quote.infants,
      rate_plan: RATE_PLAN[body.rateId],
      accommodation_ron: quote.accommodationRon,
      extras_ron: quote.extrasRon,
      city_tax_ron: quote.cityTaxRon,
      total_ron: quote.totalRon,
      extras: quote.extras,
      display_currency: body.displayCurrency,
      display_fx_rate: displayFxRate,
      currency: 'RON',
      status: 'pending',
      guest_name: body.contact.name,
      guest_email: body.contact.email,
      guest_phone: body.contact.phone,
      invoice_company: body.contact.invoiceCompany,
      invoice_vat: body.contact.invoiceVat,
      invoice_reg_com: body.contact.invoiceRegCom,
      invoice_address: body.contact.invoiceAddress,
    })
    .select('id')
    .single();
  if (insertError || !booking) {
    console.error('checkout: booking insert failed:', insertError?.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }

  // 5 — Stripe Checkout Session, charged in RON (bani = ×100; totals are whole RON).
  const origin = trustedOrigin(req);
  const lineItems: Array<{
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string };
    };
  }> = [
    {
      quantity: 1,
      price_data: {
        currency: 'ron',
        unit_amount: Math.round(quote.accommodationRon * 100),
        product_data: {
          name: `${quote.propertyName} — ${quote.nights} night${quote.nights === 1 ? '' : 's'}`,
        },
      },
    },
    ...quote.extras.map((extra) => ({
      quantity: 1,
      price_data: {
        currency: 'ron',
        unit_amount: Math.round(extra.ron * 100),
        product_data: { name: `Extra service — ${extra.name}` },
      },
    })),
    {
      quantity: 1,
      price_data: {
        currency: 'ron',
        unit_amount: Math.round(quote.cityTaxRon * 100),
        product_data: { name: 'City tax (state tax, pass-through)' },
      },
    },
  ];

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        success_url: `${origin}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?cancelled=1`,
        client_reference_id: user.id,
        customer_email: body.contact.email,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        metadata: {
          bookingId: booking.id,
          propertyId: quote.propertyId,
          listingMapId: String(quote.listingMapId),
          checkIn: quote.checkIn,
          checkOut: quote.checkOut,
          userId: user.id,
        },
      },
      // One session per booking row — a client retry reuses it instead of
      // creating a duplicate charge path.
      { idempotencyKey: `checkout_${booking.id}` },
    );

    if (!session.url) throw new Error('session has no url');

    await admin
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(
      'checkout: session creation failed:',
      err instanceof Error ? err.message : err,
    );
    // The pending row must not linger as bookable state.
    await admin.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    return NextResponse.json({ error: 'payment_init_failed' }, { status: 502 });
  }
}
