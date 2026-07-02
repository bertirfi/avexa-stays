'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_DISPLAY_CURRENCY,
  DISPLAY_CURRENCIES,
  formatApproxEquivalent,
  formatMoney,
  ronToDisplay,
  type DisplayCurrency,
  type DisplayRates,
} from '@/lib/currency';

/**
 * Display-currency context. RON is the money of record; this context only
 * changes how amounts are SHOWN. Rates come from server env via the root
 * layout (never import lib/pricing client-side).
 */

const STORAGE_KEY = 'avexa_currency';

interface CurrencyContextValue {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  rates: DisplayRates;
  /** Exact numeric conversion of a RON amount into the display currency. */
  convert: (ron: number) => number;
  /** "€79" / "415 RON" (decimals 0, default) or "€79.05" (decimals 2). */
  format: (ron: number, opts?: { decimals?: 0 | 2 }) => string;
  /** "≈ €11.43" for amounts that stay visibly RON — null when displaying RON. */
  approx: (ron: number) => string | null;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  rates,
  children,
}: {
  rates: DisplayRates;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>(
    DEFAULT_DISPLAY_CURRENCY,
  );

  // SSR renders the EUR default; the stored preference applies after mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (DISPLAY_CURRENCIES as readonly string[]).includes(stored)) {
        setCurrencyState(stored as DisplayCurrency);
      }
    } catch {
      // Storage unavailable (private mode) — keep the default.
    }
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: preference just won't persist.
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      rates,
      convert: (ron) => ronToDisplay(ron, currency, rates),
      format: (ron, opts) => formatMoney(ron, currency, rates, opts),
      approx: (ron) => formatApproxEquivalent(ron, currency, rates),
    }),
    [currency, setCurrency, rates],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within <CurrencyProvider>');
  return ctx;
}
