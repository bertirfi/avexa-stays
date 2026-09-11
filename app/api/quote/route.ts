import { NextResponse } from 'next/server';
import { quoteBooking } from '@/lib/booking/quote';
import { QuoteInputSchema } from '@/lib/booking/schema';
import { rateLimited } from '@/lib/rate-limit';

/**
 * Read-only booking quote — the authoritative money the checkout page shows.
 *
 * The checkout UI must NOT render money from the localStorage draft. It POSTs
 * here on mount and renders these SERVER numbers — same schema + same pricing
 * math as /api/checkout (lib/booking/quote), read from the Supabase availability
 * cache; the charge is re-derived LIVE in /api/checkout. No booking row is
 * created here.
 *
 * Trust boundary (api-validation rule): input validated with the shared Zod
 * schema. Never trusts a client price. No session required since guest
 * checkout (04.09): read-only, no side effects, returns only public prices.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (rateLimited(req, 'quote', 30)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  const parsed = QuoteInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const body = parsed.data;

  const quote = await quoteBooking({
    propertyId: body.propertyId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    adults: body.adults,
    children: body.children,
    infants: body.infants,
    extras: body.extras,
    // Public route → Supabase cache, never live Hostaway (hostaway rule). The
    // charge itself is re-quoted LIVE in /api/checkout; Stripe shows that amount.
    source: 'cache',
  });
  if (!quote.ok) {
    // Dates no longer bookable / Hostaway unreachable → the page shows a clear
    // "no longer available" state. 409 = the request was valid but can't be met.
    return NextResponse.json({ error: 'unavailable' }, { status: 409 });
  }

  // Expose exactly what BookingSummary needs — all RON integers.
  return NextResponse.json({
    accommodationRon: quote.accommodationRon,
    nightly: quote.nightly,
    extras: quote.extras,
    extrasRon: quote.extrasRon,
    cleaningRon: quote.cleaningRon,
    cityTaxRon: quote.cityTaxRon,
    totalRon: quote.totalRon,
    nights: quote.nights,
    perNightRon: Math.round(quote.accommodationRon / quote.nights),
  });
}
