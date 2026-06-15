import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getListings, getListingCalendar } from '@/lib/hostaway/client';
import type { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

const SYNC_DAYS = 180;

type AvailabilityInsert = Database['public']['Tables']['availability']['Insert'];

function isAuthed(request: Request): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const sync = process.env.SYNC_SECRET;
  const cron = process.env.CRON_SECRET;
  return Boolean(
    (sync && auth === `Bearer ${sync}`) || (cron && auth === `Bearer ${cron}`),
  );
}

/**
 * Hostaway -> Supabase sync: availability + nightly price (RON) per mapped
 * property, plus price_from_ron and bed/bath backfill from the listing.
 *
 * Bearer SYNC_SECRET (manual) or CRON_SECRET (Vercel cron — registered at
 * launch). GET so a Vercel cron can call it directly.
 */
export async function GET(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: props, error: propsError } = await supabase
    .from('properties')
    .select('id, hostaway_listing_id')
    .not('hostaway_listing_id', 'is', null);
  if (propsError) {
    return NextResponse.json({ ok: false, error: propsError.message }, { status: 500 });
  }

  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + SYNC_DAYS * 86_400_000).toISOString().slice(0, 10);

  // One listings call (8 listings) instead of one per property.
  const listings = await getListings();
  const listingById = new Map(listings.map((l) => [String(l.id), l]));

  const summary: Array<Record<string, unknown>> = [];

  for (const prop of props ?? []) {
    const listingId = prop.hostaway_listing_id;
    if (!listingId) continue;
    const listing = listingById.get(String(listingId));

    try {
      const calendar = await getListingCalendar(listingId, start, end);

      const rows: AvailabilityInsert[] = calendar
        .filter((d) => Boolean(d.date))
        .map((d) => {
          const available = d.isAvailable === 1 || d.status === 'available';
          const price =
            typeof d.price === 'number' && d.price > 0
              ? d.price
              : (listing?.price ?? 0);
          return {
            property_id: prop.id,
            date: d.date,
            available,
            price_ron: price,
            min_stay: d.minimumStay ?? 1,
          };
        });

      if (rows.length) {
        const { error } = await supabase
          .from('availability')
          .upsert(rows, { onConflict: 'property_id,date' });
        if (error) throw new Error(`availability upsert: ${error.message}`);
      }

      const openPrices = rows
        .filter((r) => r.available && r.price_ron > 0)
        .map((r) => r.price_ron);
      const priceFrom = openPrices.length
        ? Math.min(...openPrices)
        : (listing?.price ?? null);

      await supabase
        .from('properties')
        .update({
          price_from_ron: priceFrom,
          bedrooms:
            typeof listing?.bedroomsNumber === 'number'
              ? listing.bedroomsNumber
              : undefined,
          bathrooms:
            typeof listing?.bathroomsNumber === 'number'
              ? listing.bathroomsNumber
              : undefined,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', prop.id);

      summary.push({ id: prop.id, listingId, days: rows.length, priceFrom });
    } catch (e) {
      summary.push({
        id: prop.id,
        listingId,
        error: e instanceof Error ? e.message : 'unknown error',
      });
    }
  }

  return NextResponse.json({ ok: true, days: SYNC_DAYS, synced: summary });
}
