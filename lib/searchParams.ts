import { ymd } from '@/lib/date';
import type { GuestCounts } from '@/types';

/**
 * The ONE place that defines the public search URL contract.
 *
 *   /locations?arrival=YYYY-MM-DD&departure=YYYY-MM-DD&adults=2&children=0&infants=0[&where=zone]
 *   /locations/[slug]?arrival=…&departure=…&adults=…&children=…&infants=…
 *
 * `checkIn` / `checkOut` are still READ as legacy aliases so links shared
 * before the rename keep working — but nothing writes them any more.
 * (The internal /api/availability query keeps its own checkIn/checkOut names;
 * it is not a user-facing URL.)
 */

/** Minimal shape shared by URLSearchParams and Next's ReadonlyURLSearchParams. */
interface ParamReader {
  get(name: string): string | null;
}

export function readRangeParams(sp: ParamReader): {
  arrival: string | null;
  departure: string | null;
} {
  return {
    arrival: sp.get('arrival') ?? sp.get('checkIn'),
    departure: sp.get('departure') ?? sp.get('checkOut'),
  };
}

export function readGuestParams(sp: ParamReader): GuestCounts | null {
  const adults = sp.get('adults');
  if (adults === null) return null;
  const clamp = (raw: string | null, min: number) =>
    Math.min(10, Math.max(min, Number(raw) || min));
  return {
    adults: clamp(adults, 1),
    children: clamp(sp.get('children'), 0),
    infants: clamp(sp.get('infants'), 0),
  };
}

/** Canonical query string for a search selection. Empty string when nothing is set. */
export function buildSearchQuery(opts: {
  start?: Date | null;
  end?: Date | null;
  /** Pre-serialized 'YYYY-MM-DD' alternative to `start`/`end`. */
  arrival?: string | null;
  departure?: string | null;
  guests?: GuestCounts;
  /** Neighborhood id — omitted when 'all' (absence means "all"). */
  where?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.where && opts.where !== 'all') params.set('where', opts.where);
  // Local 'YYYY-MM-DD' (lib/date) — toISOString would shift the day in
  // negative-offset timezones, sending the wrong arrival downstream.
  const arrival = opts.arrival ?? (opts.start ? ymd(opts.start) : null);
  const departure = opts.departure ?? (opts.end ? ymd(opts.end) : null);
  if (arrival) params.set('arrival', arrival);
  if (departure) params.set('departure', departure);
  if (opts.guests) {
    params.set('adults', String(opts.guests.adults));
    params.set('children', String(opts.guests.children));
    params.set('infants', String(opts.guests.infants));
  }
  return params.toString();
}
