import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { quoteBooking } from '@/lib/booking/quote';
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

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const BodySchema = z.object({
  propertyId: z.string().trim().min(1).max(40),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(10),
  children: z.number().int().min(0).max(10),
  infants: z.number().int().min(0).max(10),
  rateId: z.enum(['saver', 'flex']),
  breakfast: z.boolean().default(false),
  displayCurrency: z.enum(['EUR', 'RON', 'USD']).default('EUR'),
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: optionalTrimmed(40),
    invoiceCompany: optionalTrimmed(200),
    invoiceVat: optionalTrimmed(40),
    invoiceRegCom: optionalTrimmed(60),
    invoiceAddress: optionalTrimmed(400),
  }),
});

const RATE_PLAN: Record<'saver' | 'flex', 'non_refundable' | 'flexible'> = {
  saver: 'non_refundable',
  flex: 'flexible',
};

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
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
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
  const origin = new URL(req.url).origin;
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
