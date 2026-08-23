import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { quoteBooking } from '@/lib/booking/quote';
import { QuoteInputSchema } from '@/lib/booking/schema';

/**
 * Read-only booking quote — the authoritative money the checkout page shows.
 *
 * The checkout UI must NOT render money from the localStorage draft (written by
 * the stay sidebar off the 15-min cache). It POSTs here on mount and renders
 * these SERVER numbers — the same numbers /api/checkout charges (both derive
 * from lib/booking/quote via the shared schema). No booking row is created here.
 *
 * Trust boundary (api-validation rule): identity from the Supabase session,
 * input validated with the shared Zod schema. Never trusts a client price.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Members only — same gate as /api/checkout.
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
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
    breakfast: body.breakfast,
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
    extrasRon: quote.extrasRon,
    cleaningRon: quote.cleaningRon,
    cityTaxRon: quote.cityTaxRon,
    totalRon: quote.totalRon,
    nights: quote.nights,
    perNightRon: Math.round(quote.accommodationRon / quote.nights),
  });
}
