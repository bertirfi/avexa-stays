/**
 * Pricing pipeline — spec §3.1, locked 2026-06-16.
 *
 *   effective_RON = base_RON × (1 + markup)            // markup default 18%
 *   effective_EUR = ceil( effective_RON ÷ BNR × (1 + fxMargin) )  // fxMargin default 3%
 *
 * effective_EUR IS the charged amount AND the displayed "member rate".
 * The member discount is presentation-only:  rack = effective ÷ (1 − 0.15).
 * Both knobs are configurable in ONE place (env), never per-listing.
 */

export const MEMBER_DISCOUNT = 0.15;

function pct(value: string | undefined, fallbackPercent: number): number {
  if (value === undefined || value.trim() === '') return fallbackPercent / 100;
  const n = Number(value);
  return Number.isFinite(n) ? n / 100 : fallbackPercent / 100;
}

export function getMarkup(): number {
  return pct(process.env.AVEXA_MARKUP_PERCENT, 18);
}

export function getFxMargin(): number {
  return pct(process.env.AVEXA_FX_MARGIN_PERCENT, 3);
}

/** Effective EUR per night — the charged amount / member rate. */
export function effectiveEurPerNight(ron: number, bnrRate: number): number {
  if (!(ron > 0) || !(bnrRate > 0)) return 0;
  return Math.ceil((ron * (1 + getMarkup())) / bnrRate * (1 + getFxMargin()));
}

/** Struck-through "rack" rate behind the "15% off" presentation. */
export function rackEurPerNight(effectiveEur: number): number {
  return Math.round(effectiveEur / (1 - MEMBER_DISCOUNT));
}
