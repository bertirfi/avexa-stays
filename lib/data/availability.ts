import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { accommodationRonPerNight } from '@/lib/pricing';
import { ymd } from '@/lib/date';

export interface DayPrice {
  /** Accommodation RON per night (money of record; convert only at display). */
  ron: number;
  available: boolean;
  minStay: number;
}

/** Keyed by 'YYYY-MM-DD'. Empty when Supabase is unavailable (graceful fallback). */
export type AvailabilityMap = Record<string, DayPrice>;

/**
 * Per-night availability + price for a property, for the next `days` days.
 * Server-only (service-role). Returns {} on any failure so the calendar and
 * sidebar fall back to the flat listing price.
 */
export async function getAvailabilityMap(
  propertyId: string,
  days = 180,
): Promise<AvailabilityMap> {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    const { data, error } = await getSupabaseAdmin()
      .from('availability')
      .select('date, available, price_ron, min_stay')
      .eq('property_id', propertyId)
      .gte('date', ymd(start))
      .lte('date', ymd(end))
      .order('date');

    if (error || !data) return {};

    const map: AvailabilityMap = {};
    for (const row of data) {
      map[row.date] = {
        ron: accommodationRonPerNight(Number(row.price_ron)),
        available: Boolean(row.available),
        minStay: row.min_stay ?? 1,
      };
    }
    return map;
  } catch {
    return {};
  }
}
