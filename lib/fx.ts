import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Currency engine — spec D2:
 * Hostaway prices arrive in RON; the site displays and charges EUR at the
 * BNR daily rate plus a fixed margin, with per-night amounts rounded UP to
 * a whole euro.
 */
export const FX_MARGIN = 0.03;
export const BNR_RATES_URL = 'https://www.bnr.ro/nbrfxrates.xml';
/** Last-resort EUR/RON if the cached rate is unavailable. */
export const FALLBACK_EUR_RON = 5.06;

export interface BnrEurRate {
  /** Publication date, YYYY-MM-DD */
  date: string;
  /** RON per 1 EUR */
  rate: number;
}

/** Per-night price: round UP to a whole euro (clean display prices). */
export function ronToEurPerNight(ron: number, bnrRate: number): number {
  return Math.ceil((ron / bnrRate) * (1 + FX_MARGIN));
}

/** Non-nightly amounts (city tax, partial fees): 2-decimal precision. */
export function ronToEurAmount(ron: number, bnrRate: number): number {
  return Math.round((ron / bnrRate) * (1 + FX_MARGIN) * 100) / 100;
}

/**
 * Fetch today's EUR rate from BNR. The XML format has been stable for years:
 * <Cube date="YYYY-MM-DD"><Rate currency="EUR">4.97</Rate>...
 */
export async function fetchBnrEurRate(): Promise<BnrEurRate> {
  const res = await fetch(BNR_RATES_URL, {
    headers: { 'user-agent': 'avexa-stays/1.0 (fx sync)' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BNR fetch failed: HTTP ${res.status}`);
  const xml = await res.text();

  const date = xml.match(/<Cube date="(\d{4}-\d{2}-\d{2})"/)?.[1];
  const eur = xml.match(
    /<Rate currency="EUR"(?:\s+multiplier="(\d+)")?>([\d.]+)<\/Rate>/
  );
  if (!date || !eur) throw new Error('BNR XML parse failed — format changed?');

  const multiplier = eur[1] ? Number(eur[1]) : 1;
  const rate = Number(eur[2]) / multiplier;
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`BNR EUR rate invalid: ${eur[2]}`);
  }
  return { date, rate };
}

/**
 * Current EUR rate from the exchange_rates cache; falls back to a live BNR
 * fetch (and stores it) when the cache is empty or stale.
 */
/**
 * EUR/RON rate for pricing — reads ONLY the Supabase cache (kept fresh by the
 * daily /api/cron/fx job). Never does a live BNR fetch, so it is safe to call
 * during static/ISR rendering (a no-store fetch would force the route dynamic).
 * Falls back to a constant when the cache is empty (e.g. cron hasn't run yet).
 */
export async function getCachedEurRate(): Promise<BnrEurRate> {
  try {
    const { data } = await getSupabaseAdmin()
      .from('exchange_rates')
      .select('date, rate')
      .eq('currency', 'EUR')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return { date: data.date, rate: Number(data.rate) };
  } catch (e) {
    console.error(
      'getCachedEurRate read failed:',
      e instanceof Error ? e.message : e,
    );
  }
  return { date: 'fallback', rate: FALLBACK_EUR_RON };
}
