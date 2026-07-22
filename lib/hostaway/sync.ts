import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getListing, getListingCalendar } from './client';
import type { Database } from '@/types/database.types';

/**
 * Single source of truth for deriving the Supabase availability cache from a
 * Hostaway listing calendar. Both the full sync cron (app/api/sync/hostaway)
 * and the unified webhook (app/api/webhooks/hostaway) call this so the two
 * paths are byte-identical in behaviour — previously the webhook hardcoded
 * price_ron: 0 while the cron applied a listing.price fallback, which silently
 * diverged the two caches.
 *
 * Server-only (imports the admin client + the server-only Hostaway client).
 */

type AvailabilityInsert = Database['public']['Tables']['availability']['Insert'];

// Bookable horizon is 12 months; the old 180-day window silently hid far-out
// OTA bookings (a Booking.com reservation 200 days out never reached the cache).
export const SYNC_WINDOW_DAYS = 380;

/**
 * Re-pull one listing's calendar and mirror it into the availability cache,
 * then recompute the property's price_from_ron. Idempotent: the upsert mirrors
 * Hostaway truth on (property_id, date).
 */
export async function syncListingAvailability(opts: {
  propertyId: string;
  listingMapId: number;
}): Promise<{ days: number; priceFrom: number | null }> {
  const { propertyId, listingMapId } = opts;
  const supabase = getSupabaseAdmin();

  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + SYNC_WINDOW_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const calendar = await getListingCalendar(listingMapId, startDate, endDate);
  // One listing fetch for the base-price fallback (missing calendar prices).
  const listing = await getListing(listingMapId);

  const rows: AvailabilityInsert[] = calendar
    .filter((d) => Boolean(d.date))
    .map((d) => {
      const available = d.isAvailable === 1 || d.status === 'available';
      const price =
        typeof d.price === 'number' && d.price > 0
          ? d.price
          : (listing?.price ?? 0);
      return {
        property_id: propertyId,
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
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', propertyId);

  return { days: rows.length, priceFrom };
}
