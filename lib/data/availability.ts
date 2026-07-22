import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { accommodationRonPerNight } from '@/lib/pricing';
import { ymd, parseYmd } from '@/lib/date';

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

/** Availability verdict for one property over a requested [checkIn, checkOut) range. */
export interface PropertyRangeAvailability {
  available: boolean;
  /** Accommodation RON total for the stay (only when available). */
  totalRon?: number;
  /** totalRon / nights, rounded (only when available). */
  nightlyRon?: number;
  /** Nearest fully-free window of the same length (only when NOT available). */
  alternative?: { checkIn: string; checkOut: string };
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 'YYYY-MM-DD' for today in Europe/Bucharest (the server may run in UTC). */
function todayBucharest(): string {
  // en-CA formats as YYYY-MM-DD.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
}

/**
 * Range availability for ALL properties at once (one query, ~8 props × ~60 rows).
 * A property is available iff EVERY night in [checkIn, checkOut) exists in the
 * cache AND is available — missing rows are conservatively NOT available.
 * Unavailable properties get the nearest same-length free window (±1..±7 days,
 * never starting in the past) as `alternative`.
 * Server-only (service-role). Returns {} on any failure — callers treat that as
 * "no availability data → don't filter".
 */
export async function getRangeAvailability(
  checkIn: string,
  checkOut: string,
): Promise<Record<string, PropertyRangeAvailability>> {
  try {
    const start = parseYmd(checkIn);
    const end = parseYmd(checkOut);
    if (!start || !end || start >= end) return {};
    const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);

    // One window covering the request ± the 7-day alternative scan.
    const { data, error } = await getSupabaseAdmin()
      .from('availability')
      .select('property_id, date, available, price_ron, min_stay')
      .gte('date', ymd(addDays(start, -7)))
      .lt('date', ymd(addDays(end, 7)));
    if (error || !data) return {};

    const byProp = new Map<
      string,
      Map<string, { available: boolean; ron: number; minStay: number }>
    >();
    for (const row of data) {
      let days = byProp.get(row.property_id);
      if (!days) {
        days = new Map();
        byProp.set(row.property_id, days);
      }
      days.set(row.date, {
        available: Boolean(row.available),
        ron: accommodationRonPerNight(Number(row.price_ron)),
        minStay: row.min_stay ?? 1,
      });
    }

    const today = todayBucharest();
    const out: Record<string, PropertyRangeAvailability> = {};

    for (const [propId, days] of byProp) {
      /** Sum of nightly RON when every night from `from` is free, else null. */
      const windowTotal = (from: Date): number | null => {
        let total = 0;
        for (let i = 0; i < nights; i += 1) {
          const day = days.get(ymd(addDays(from, i)));
          if (!day?.available) return null; // missing row = NOT available
          // First night gates min-stay — otherwise we'd show a suite as free
          // that /api/quote will then reject, dead-ending the guest.
          if (i === 0 && day.minStay > nights) return null;
          total += day.ron;
        }
        return total;
      };

      const total = windowTotal(start);
      if (total !== null) {
        out[propId] = {
          available: true,
          totalRon: total,
          nightlyRon: Math.round(total / nights),
        };
        continue;
      }

      // Nearest same-length free window, |offset| ascending (+1, -1, +2, ...).
      let alternative: PropertyRangeAvailability['alternative'];
      for (let abs = 1; abs <= 7 && !alternative; abs += 1) {
        for (const offset of [abs, -abs]) {
          const altStart = addDays(start, offset);
          if (ymd(altStart) < today) continue; // never suggest a past check-in
          if (windowTotal(altStart) !== null) {
            alternative = { checkIn: ymd(altStart), checkOut: ymd(addDays(altStart, nights)) };
            break;
          }
        }
      }
      out[propId] = alternative ? { available: false, alternative } : { available: false };
    }
    return out;
  } catch {
    return {};
  }
}
