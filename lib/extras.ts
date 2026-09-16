/**
 * Extra services catalogue — AVX-08 v3.2 (in force 1 Sep 2026), decision D21.
 * Single source of truth for the property page, the checkout quote, Stripe
 * line items, My Trips add-ons and the /extra-services page.
 *
 * Money of record: RON, VAT included, per stay. Prices are "introductory,
 * reviewed quarterly" — change them HERE only. Pure module: no I/O.
 */
import { bucharestMs } from '@/lib/date';

export type ExtraId =
  | 'early_checkin'
  | 'late_checkout'
  | 'time_cravings'
  | 'mid_journey_cleaning'
  | 'deep_sleep'
  | 'cinema_cravings'
  | 'family_travel'
  | 'premium_self_care'
  | 'surprise_setup'
  | 'romanian_keepsake';

export type Rooms = 1 | 2 | 3;

export interface ExtraService {
  id: ExtraId;
  name: string;
  /** One-line teaser for cards. */
  tagline: string;
  /** "What it includes" — AVX-08 wording, verbatim. */
  includes: string;
  /** Flat RON price, or per apartment size (Mid-journey Cleaning). */
  priceRon: number | Record<Rooms, number>;
  /** Hours before check-in (15:00 Bucharest) the request must be in. */
  leadHours: 24 | 72;
  /** AVX-08 "Request" column, shown as a chip. */
  leadLabel: string;
  /**
   * Early/Late/Time & Cravings are sold as a paid request the team confirms
   * within 48h (full refund if it cannot be honoured). The phrase "subject to
   * availability" stays in the Terms only — never at the point of purchase
   * (client 12.09: it creates doubt where the case is very rare anyway).
   */
  needsConfirmation: boolean;
  /** Public image path — null until the client delivers photos. */
  image: string | null;
}

export const EXTRAS: ExtraService[] = [
  {
    id: 'early_checkin',
    name: 'Early check-in',
    tagline: 'Arrive from 13:00 instead of 15:00.',
    includes: 'Arrive from 13:00 instead of 15:00',
    priceRon: 119,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: true,
    image: null,
  },
  {
    id: 'late_checkout',
    name: 'Late check-out',
    tagline: 'Keep the apartment until 13:00.',
    includes: 'Keep the apartment until 13:00 instead of 11:00',
    priceRon: 119,
    leadHours: 24,
    leadLabel: 'The evening before',
    needsConfirmation: true,
    image: null,
  },
  {
    id: 'time_cravings',
    name: 'Time & Cravings',
    tagline: 'Early check-in, late check-out and a Romanian snack tray.',
    includes:
      'Early check-in + late check-out + a Romanian snack tray waiting in the apartment (Buzău pretzels, sweets, water)',
    priceRon: 259,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: true,
    image: null,
  },
  {
    id: 'mid_journey_cleaning',
    name: 'Mid-journey Cleaning',
    tagline: 'A full professional clean during your stay.',
    includes:
      'A full professional clean during your stay, including a fresh set of bed linen and towels',
    // Per apartment (studio / two-room / three-room), client 12.09: 125 not 99.
    priceRon: { 1: 125, 2: 129, 3: 149 },
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'deep_sleep',
    name: 'Deep Sleep & Recovery',
    tagline: 'Everything for a silent, restful night.',
    includes:
      'Premium ear plugs, sleep mask, shower steamers, self-heating eye masks, lavender sachet',
    priceRon: 169,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'cinema_cravings',
    name: 'Cinema Cravings',
    tagline: 'The clean movie-night kit.',
    includes:
      'Gourmet popcorn, Romanian pretzels, premium tonic water or lemonade — the clean movie-night kit',
    priceRon: 139,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'family_travel',
    name: 'Family Travel Light',
    tagline: 'Baby carrier and white-noise device for the whole stay.',
    includes:
      'Stay-long rental: ergonomic baby carrier + white-noise device, with washable protections',
    priceRon: 129,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'premium_self_care',
    name: 'Premium Self-Care',
    tagline: 'Sealed spa-grade care, yours to keep.',
    includes: 'Korean sheet masks, hydrogel eye patches, shower steamers — sealed, and yours to keep',
    priceRon: 169,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'surprise_setup',
    name: 'Surprise Setup',
    tagline: 'Balloons, a hand-written card and sparkling wine, ready on arrival.',
    includes:
      '15–20 premium balloons inflated in the apartment, a hand-written card, non-alcoholic sparkling wine',
    priceRon: 229,
    leadHours: 72,
    leadLabel: '72h ahead',
    needsConfirmation: false,
    image: null,
  },
  {
    id: 'romanian_keepsake',
    name: 'Romanian Keepsake',
    tagline: 'The take-home souvenir box.',
    includes: 'Sealed gift box: magnet, artisan soap, jarred honey, local tea — the take-home souvenir',
    priceRon: 169,
    leadHours: 24,
    leadLabel: '24h ahead',
    needsConfirmation: false,
    image: null,
  },
];

export const EXTRA_IDS = EXTRAS.map((e) => e.id) as [ExtraId, ...ExtraId[]];

export function getExtra(id: string): ExtraService | undefined {
  return EXTRAS.find((e) => e.id === id);
}

/** Apartment size from the per-stay cleaning fee (120 studio / 150 two-room / 180 three-room). */
export function roomsForCleaning(cleaningRon: number): Rooms {
  if (cleaningRon >= 180) return 3;
  if (cleaningRon >= 150) return 2;
  return 1;
}

export function extraPriceRon(extra: ExtraService, rooms: Rooms): number {
  return typeof extra.priceRon === 'number' ? extra.priceRon : extra.priceRon[rooms];
}

/** "125 / 129 / 149 RON" for the size-dependent item, "169 RON" otherwise. */
export function extraPriceLabel(extra: ExtraService, rooms?: Rooms): string {
  if (typeof extra.priceRon === 'number') return `${extra.priceRon} RON`;
  if (rooms) return `${extra.priceRon[rooms]} RON`;
  return `${extra.priceRon[1]} / ${extra.priceRon[2]} / ${extra.priceRon[3]} RON`;
}

/** Check-in moment: 15:00 Europe/Bucharest on the check-in date, as epoch ms. */
export function checkInMs(checkIn: string): number {
  return bucharestMs(checkIn, 15);
}

/** Extras whose lead time has not passed for a given check-in date. */
export function extrasStillBookable(checkIn: string, now = Date.now()): ExtraService[] {
  const ci = checkInMs(checkIn);
  return EXTRAS.filter((e) => ci - e.leadHours * 3_600_000 > now);
}

/** Guest-facing rules, AVX-08 §6 wording — reused wherever extras are sold. */
export const EXTRAS_COPY = {
  confirm: 'Early check-in, late check-out and Time & Cravings are confirmed by our team within 48 hours — full refund if we cannot make it happen.',
  cancel:
    'Free to cancel up to the lead time shown. After that, packages we have already bought in or prepared are charged in full.',
  delivery: 'Packages are prepared once, for your arrival. They are not re-stocked during the stay.',
  avx: 'Members can pay with AVX Coins — 1 AVX = 1 RON, from the very first tier.',
} as const;

/** Shape of one entry in bookings.extras jsonb (cleaning uses id 'cleaning'). */
export type BookingExtra = {
  id: string;
  name: string;
  ron: number;
  /** Set on add-ons bought after booking — Stripe session id, for idempotency. */
  sessionId?: string;
  /** Add-ons only: the Stripe charge to refund on cancellation. */
  paymentIntentId?: string;
};
