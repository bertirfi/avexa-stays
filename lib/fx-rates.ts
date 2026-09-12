import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getFxRateEur, getFxRateUsd } from '@/lib/pricing';
import type { DisplayRates } from '@/lib/currency';

/**
 * Live display rates — AVX-19 Block I / decision D11 (AVX-08 §intro):
 * "amounts shown in another display currency are converted at the official
 * BNR exchange rate of the previous day plus 1%". RON stays the money of
 * record; this only decides what the EUR/USD equivalents look like.
 *
 * Source: `exchange_rates` (filled daily by /api/cron/fx). We take the latest
 * row dated BEFORE today (Bucharest) — the "previous day" — and fall back to
 * the newest row, then to the fixed env rates, so the site never shows nothing.
 * The +1% is applied as: 1 RON shows as (1 / BNR) × 1.01 in foreign currency,
 * i.e. the guest's foreign equivalent is 1% above the official rate.
 *
 * Server-only. Cached one hour; the checkout snapshots the rate it used into
 * bookings.display_fx_rate, so a rate change never touches an existing booking.
 */

export const FX_MARGIN = 1.01;

function todayBucharest(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
}

const readRates = unstable_cache(
  async (): Promise<DisplayRates> => {
    const fallback: DisplayRates = { EUR: getFxRateEur(), USD: getFxRateUsd() };
    try {
      const { data } = await getSupabaseAdmin()
        .from('exchange_rates')
        .select('date, currency, rate')
        .in('currency', ['EUR', 'USD'])
        .order('date', { ascending: false })
        .limit(8);
      if (!data?.length) return fallback;
      const today = todayBucharest();
      const pick = (currency: 'EUR' | 'USD'): number | null => {
        const rows = data.filter((r) => r.currency === currency);
        const row = rows.find((r) => r.date < today) ?? rows[0];
        const rate = row ? Number(row.rate) : NaN;
        // RON per 1 unit; dividing by the margin makes the foreign amount 1% higher.
        return Number.isFinite(rate) && rate > 0 ? rate / FX_MARGIN : null;
      };
      return { EUR: pick('EUR') ?? fallback.EUR, USD: pick('USD') ?? fallback.USD };
    } catch {
      return fallback;
    }
  },
  ['display-fx-rates'],
  { revalidate: 3600 },
);

/** Display-rates bundle for <CurrencyProvider> and the checkout snapshot. */
export async function getLiveDisplayRates(): Promise<DisplayRates> {
  return readRates();
}
