import { NextResponse } from 'next/server';
import { getListings, getListingCalendar } from '@/lib/hostaway/client';

export const dynamic = 'force-dynamic';

/**
 * Wave 1 validation + mapping helper. Bearer SYNC_SECRET.
 * Returns the listing summary (so the Hostaway listing_id <-> AVEXA property
 * mapping can be filled in) plus a small calendar sample to confirm the
 * calendar field shape before the real sync (Wave 1b) depends on it.
 *
 * Run locally:  npm run dev  then
 *   curl -H "Authorization: Bearer <SYNC_SECRET>" http://localhost:3000/api/hostaway/diagnostic
 */
export async function GET(request: Request) {
  const secret = process.env.SYNC_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const listings = await getListings();

    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
    const firstId = listings[0]?.id;
    const calendarSample = firstId
      ? (await getListingCalendar(firstId, today, end)).slice(0, 5)
      : [];

    return NextResponse.json({
      ok: true,
      count: listings.length,
      listings: listings.map((l) => ({
        id: l.id,
        name: l.name,
        city: l.city,
        address: l.address ?? l.publicAddress,
        lat: l.lat,
        lng: l.lng,
        price: l.price,
        currencyCode: l.currencyCode,
        bedroomsNumber: l.bedroomsNumber,
        bedsNumber: l.bedsNumber,
        bathroomsNumber: l.bathroomsNumber,
        personCapacity: l.personCapacity,
        cancellationPolicy: l.cancellationPolicy,
      })),
      calendarSample,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('hostaway diagnostic failed:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
