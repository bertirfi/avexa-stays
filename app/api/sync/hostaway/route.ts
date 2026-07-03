import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getListings } from '@/lib/hostaway/client';
import { SYNC_WINDOW_DAYS, syncListingAvailability } from '@/lib/hostaway/sync';

export const dynamic = 'force-dynamic';

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

  // One listings call (8 listings) for the bed/bath backfill — availability +
  // price come from the shared syncListingAvailability helper per property.
  const listings = await getListings();
  const listingById = new Map(listings.map((l) => [String(l.id), l]));

  const summary: Array<Record<string, unknown>> = [];

  for (const prop of props ?? []) {
    const listingId = prop.hostaway_listing_id;
    if (!listingId) continue;
    const listing = listingById.get(String(listingId));

    try {
      // Availability, nightly price, price_from_ron and last_synced_at — the
      // single source of truth shared with the unified webhook.
      const { days, priceFrom } = await syncListingAvailability({
        propertyId: prop.id,
        listingMapId: Number(listingId),
      });

      // Bed/bath backfill is sync-only metadata (not part of the cache).
      await supabase
        .from('properties')
        .update({
          bedrooms:
            typeof listing?.bedroomsNumber === 'number'
              ? listing.bedroomsNumber
              : undefined,
          bathrooms:
            typeof listing?.bathroomsNumber === 'number'
              ? listing.bathroomsNumber
              : undefined,
        })
        .eq('id', prop.id);

      summary.push({ id: prop.id, listingId, days, priceFrom });
    } catch (e) {
      summary.push({
        id: prop.id,
        listingId,
        error: e instanceof Error ? e.message : 'unknown error',
      });
    }
  }

  return NextResponse.json({ ok: true, days: SYNC_WINDOW_DAYS, synced: summary });
}
