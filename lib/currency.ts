/**
 * Display-money helpers — client-safe (NO env access, no server imports).
 *
 * RON is the money of record: every stored/charged amount is RON. EUR/USD are
 * DISPLAY-ONLY conversions. The fixed display rates live in server env
 * (AVEXA_FX_RATE_EUR / AVEXA_FX_RATE_USD) and reach the client through
 * <CurrencyProvider> props — never import lib/pricing from a client component.
 */

export type DisplayCurrency = 'EUR' | 'RON' | 'USD';

export const DISPLAY_CURRENCIES: readonly DisplayCurrency[] = ['EUR', 'RON', 'USD'];

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = 'EUR';

/** RON per 1 unit of each convertible display currency. */
export interface DisplayRates {
  EUR: number;
  USD: number;
}

/**
 * City tax: RON per person per night — a state tax passed through at face
 * value (NO markup, NO payment fee). Lives here so client components can
 * show the breakdown without importing server-only pricing code.
 */
export const CITY_TAX_RON_PER_PERSON_NIGHT = 10;

/** Exact conversion of a RON amount into the display currency. */
export function ronToDisplay(
  ron: number,
  currency: DisplayCurrency,
  rates: DisplayRates,
): number {
  if (currency === 'RON') return ron;
  return ron / rates[currency];
}

const SYMBOL: Record<Exclude<DisplayCurrency, 'RON'>, string> = { EUR: '€', USD: '$' };

/**
 * Format a RON amount in the selected display currency.
 * decimals 0 (default) → rounded pill/label prices ("€79", "415 RON");
 * decimals 2 → precise checkout lines ("€11.43").
 */
export function formatMoney(
  ron: number,
  currency: DisplayCurrency,
  rates: DisplayRates,
  opts: { decimals?: 0 | 2 } = {},
): string {
  const decimals = opts.decimals ?? 0;
  const value = ronToDisplay(ron, currency, rates);
  const text =
    decimals === 0 ? String(Math.round(value)) : value.toFixed(2);
  return currency === 'RON' ? `${text} RON` : `${SYMBOL[currency]}${text}`;
}

/**
 * "≈ €11.43" equivalent for amounts that must stay visibly RON (city tax).
 * Returns null when the display currency is RON (nothing to approximate).
 */
export function formatApproxEquivalent(
  ron: number,
  currency: DisplayCurrency,
  rates: DisplayRates,
): string | null {
  if (currency === 'RON') return null;
  return `≈ ${formatMoney(ron, currency, rates, { decimals: 2 })}`;
}
