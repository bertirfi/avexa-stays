/**
 * Pricing pipeline — spec §3.1.
 *
 *   effective_RON = base_RON × (1 + markup)               // markup default 18%
 *   effective_EUR = ceil( effective_RON ÷ fxRate × (1 + fxMargin) )  // fxMargin default 3%
 *
 * effective_EUR IS the charged amount AND the displayed "member rate".
 * Member discount is presentation-only:  rack = effective ÷ (1 − 0.15).
 *
 * FX rate is FIXED (default 5.2 RON/EUR, env AVEXA_FX_RATE) — chosen over a live
 * BNR rate for predictable, deterministic prices. The /api/cron/fx job still
 * records the real BNR rate in Supabase for monitoring drift vs this fixed rate.
 * All three knobs are configurable in ONE place (env), never per-listing.
 */

export const MEMBER_DISCOUNT = 0.15;
export const DEFAULT_FX_RATE = 5.2;

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

/** Fixed EUR/RON conversion rate (default 5.2). */
export function getFxRate(): number {
  const n = Number(process.env.AVEXA_FX_RATE);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_FX_RATE;
}

/** Effective EUR per night — the charged amount / member rate. */
export function effectiveEurPerNight(ron: number): number {
  if (!(ron > 0)) return 0;
  return Math.ceil((ron * (1 + getMarkup())) / getFxRate() * (1 + getFxMargin()));
}

/** Struck-through "rack" rate behind the "15% off" presentation. */
export function rackEurPerNight(effectiveEur: number): number {
  return Math.round(effectiveEur / (1 - MEMBER_DISCOUNT));
}
