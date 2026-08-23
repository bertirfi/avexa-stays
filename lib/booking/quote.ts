import { getListingCalendar } from '@/lib/hostaway/client';
import { HOSTAWAY_LISTING_BY_PROPERTY } from '@/lib/hostaway/mapping';
import { getPropertyData } from '@/lib/data/properties';
import { accommodationRonPerNight, cityTaxRon } from '@/lib/pricing';
import type { HostawayCalendarDay } from '@/lib/hostaway/types';

/**
 * Server-side booking quote — the ONLY price source for a charge.
 *
 * The client sends ids/dates/guests, never money. This module re-derives the
 * price from a LIVE Hostaway calendar read (critical rule: prices must match
 * Hostaway at the payment moment — the 15-min Supabase cache is not enough for
 * money) and the pricing pipeline (lib/pricing). All amounts RON.
 */

export interface QuoteInput {
  propertyId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  infants: number;
  breakfast: boolean;
}

// Type alias (not interface) so it satisfies Supabase's `Json` column type
// via TypeScript's implicit index signature on object literal types.
export type QuoteExtra = {
  id: string;
  name: string;
  ron: number;
};

export type Quote =
  | {
      ok: true;
      propertyId: string;
      listingMapId: number;
      propertyName: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      adults: number;
      children: number;
      infants: number;
      /** Taxable occupants (adults + children; infants stay free). */
      occupants: number;
      accommodationRon: number;
      /** Per-night charged prices (RON) — surfaced for the checkout breakdown (M1.1.6). */
      nightly: Array<{ date: string; ron: number }>;
      extras: QuoteExtra[];
      extrasRon: number;
      /** Per-stay cleaning fee (RON) — from the property record, never the client. */
      cleaningRon: number;
      cityTaxRon: number;
      totalRon: number;
    }
  | { ok: false; reason: 'invalid' | 'unknown_property' | 'unavailable' };

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NIGHTS = 30;

/** Whole nights between two YYYY-MM-DD dates (UTC math — timezone-proof). */
function nightsBetween(checkIn: string, checkOut: string): number {
  const [iy, im, id] = checkIn.split('-').map(Number);
  const [oy, om, od] = checkOut.split('-').map(Number);
  return Math.round((Date.UTC(oy, om - 1, od) - Date.UTC(iy, im - 1, id)) / 86_400_000);
}

function isDayBookable(day: HostawayCalendarDay | undefined): day is HostawayCalendarDay {
  if (!day) return false;
  const available = day.isAvailable === 1 || day.status === 'available';
  return available && typeof day.price === 'number' && day.price > 0;
}

export async function quoteBooking(input: QuoteInput): Promise<Quote> {
  const { propertyId, checkIn, checkOut } = input;

  // ── Validate shape ────────────────────────────────────────────────────────
  if (!YMD.test(checkIn) || !YMD.test(checkOut)) return { ok: false, reason: 'invalid' };
  const nights = nightsBetween(checkIn, checkOut);
  if (!Number.isFinite(nights) || nights < 1 || nights > MAX_NIGHTS) {
    return { ok: false, reason: 'invalid' };
  }
  const adults = Math.floor(input.adults);
  const children = Math.floor(input.children);
  const infants = Math.floor(input.infants);
  if (adults < 1 || children < 0 || infants < 0 || infants > 10 || adults + children > 10) {
    return { ok: false, reason: 'invalid' };
  }
  // "Today" in Europe/Bucharest — the server runs in UTC, and before 03:00
  // Bucharest a naive server date is still yesterday, which would let a guest
  // pay for a night already under way. (en-CA formats as YYYY-MM-DD.)
  const todayYmd = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
  if (checkIn < todayYmd) return { ok: false, reason: 'invalid' };

  // ── Resolve property + listing ───────────────────────────────────────────
  const listingMapId = HOSTAWAY_LISTING_BY_PROPERTY[propertyId];
  const property = await getPropertyData(propertyId);
  if (!listingMapId || !property) return { ok: false, reason: 'unknown_property' };

  // Capacity enforced server-side — the client guest picker is not trusted, and
  // Hostaway does not reject an over-capacity reservation on its own.
  if (adults + children > property.maxGuests) return { ok: false, reason: 'invalid' };

  // ── LIVE availability + base price (money-grade, not the cache) ─────────
  let calendar: HostawayCalendarDay[];
  try {
    calendar = await getListingCalendar(listingMapId, checkIn, checkOut);
  } catch {
    // Can't confirm live price/availability → refuse to quote (never guess money).
    return { ok: false, reason: 'unavailable' };
  }
  const byDate = new Map(calendar.map((d) => [d.date, d]));

  // Single flat rate: per-night charged price = ceil(live base × markup) —
  // the same lib/pricing math the sidebar's availability cache displays.
  const nightly: Array<{ date: string; ron: number }> = [];
  for (let i = 0; i < nights; i += 1) {
    const [y, m, d] = checkIn.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const key = dt.toISOString().slice(0, 10);
    const day = byDate.get(key);
    if (!isDayBookable(day)) return { ok: false, reason: 'unavailable' };
    if (i === 0 && (day.minimumStay ?? 1) > nights) {
      return { ok: false, reason: 'unavailable' };
    }
    nightly.push({ date: key, ron: accommodationRonPerNight(day.price as number) });
  }
  const accommodationRon = nightly.reduce((sum, n) => sum + n.ron, 0);

  // ── Extras (v1: breakfast; DB `services` catalog plugs in here later) ───
  const occupants = adults + children;
  const extras: QuoteExtra[] = [];
  if (input.breakfast) {
    const breakfast = property.upgrades?.find((u) => u.id === 'breakfast');
    if (breakfast && !breakfast.free && breakfast.price > 0) {
      extras.push({
        id: 'breakfast',
        name: breakfast.name,
        ron: breakfast.price * nights * occupants,
      });
    }
  }
  const extrasRon = extras.reduce((sum, e) => sum + e.ron, 0);

  // ── Totals (RON — pass-through city tax, no markup/fee on it) ───────────
  // Cleaning fee: per-stay, from the property record server-side (M1.1.3).
  // ?? 0 guards a DB row whose id no longer has a static catalog entry — the
  // overlay can't add cleaningRon there, and NaN must never reach a total.
  const cleaningRon = property.cleaningRon ?? 0;
  const tax = cityTaxRon(nights, occupants);
  const totalRon = accommodationRon + extrasRon + cleaningRon + tax;

  return {
    ok: true,
    propertyId,
    listingMapId,
    propertyName: property.name,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    infants,
    occupants,
    accommodationRon,
    nightly,
    extras,
    extrasRon,
    cleaningRon,
    cityTaxRon: tax,
    totalRon,
  };
}
