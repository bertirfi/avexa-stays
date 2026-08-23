import {
  CITY_TAX_RON_PER_PERSON_NIGHT,
  type DisplayRates,
} from '@/lib/currency';

/**
 * Pricing pipeline — RON is the money of record (spec §3.1, rev 2026-07-02).
 *
 * Accommodation, per night:
 *   accommodation_RON = ceil( base_RON × (1 + markup) × (1 + paymentFee) )
 *     markup     — AVEXA margin          (env AVEXA_MARKUP_PERCENT, default 21)
 *     paymentFee — card-processing cost  (env AVEXA_PAYMENT_FEE_PERCENT, default 0)
 *   Spec M1.1.1: a single flat +21% — with fee=0 this is exactly ceil(base × 1.21).
 *   Guests see ONE "total price" line — the markup/fee split is never shown.
 *
 * City tax — state tax, passed through at face value (NO markup, NO fee):
 *   city_tax_RON = CITY_TAX_RON_PER_PERSON_NIGHT × nights × persons
 *   Always its own "City Tax" line, always charged in real RON.
 *
 * Charging: ALWAYS in RON — Stripe charges RON and the Hostaway reservation
 * records the same RON total. EUR/USD are DISPLAY-ONLY conversions:
 *   display = RON ÷ AVEXA_FX_RATE_EUR (5.25) | AVEXA_FX_RATE_USD (4.65)
 * Default display currency: EUR. VAT is included in all prices — never added.
 *
 * Every knob is an env var — configured in ONE place, never per-listing.
 * Server-only: do not import from client components (display rates reach the
 * client via <CurrencyProvider> props; the markup/fee knobs never do).
 */

export const DEFAULT_FX_RATE_EUR = 5.25;
export const DEFAULT_FX_RATE_USD = 4.65;

function pct(value: string | undefined, fallbackPercent: number): number {
  if (value === undefined || value.trim() === '') return fallbackPercent / 100;
  const n = Number(value);
  return Number.isFinite(n) ? n / 100 : fallbackPercent / 100;
}

function positive(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** AVEXA margin over the Hostaway base price. */
export function getMarkup(): number {
  return pct(process.env.AVEXA_MARKUP_PERCENT, 21);
}

/** Card-processing cost applied on top of the marked-up price (0 = folded into the margin). */
export function getPaymentFee(): number {
  return pct(process.env.AVEXA_PAYMENT_FEE_PERCENT, 0);
}

/** Display rate: RON per 1 EUR. */
export function getFxRateEur(): number {
  return positive(process.env.AVEXA_FX_RATE_EUR, DEFAULT_FX_RATE_EUR);
}

/** Display rate: RON per 1 USD. */
export function getFxRateUsd(): number {
  return positive(process.env.AVEXA_FX_RATE_USD, DEFAULT_FX_RATE_USD);
}

/** Display-rates bundle for <CurrencyProvider> (server layout → client). */
export function getDisplayRates(): DisplayRates {
  return { EUR: getFxRateEur(), USD: getFxRateUsd() };
}

/** Accommodation RON per night — the charged per-night amount (whole RON). */
export function accommodationRonPerNight(baseRon: number): number {
  if (!(baseRon > 0)) return 0;
  return Math.ceil(baseRon * (1 + getMarkup()) * (1 + getPaymentFee()));
}

/** City tax for a stay — pass-through state tax, whole RON. */
export function cityTaxRon(nights: number, persons: number): number {
  if (!(nights > 0) || !(persons > 0)) return 0;
  return CITY_TAX_RON_PER_PERSON_NIGHT * nights * persons;
}
