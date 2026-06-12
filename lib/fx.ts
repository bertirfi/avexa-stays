import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Currency engine — spec D2:
 * Hostaway prices arrive in RON; the site displays and charges EUR at the
 * BNR daily rate plus a fixed margin, with per-night amounts rounded UP to
 * a whole euro.
 */
export const FX_MARGIN = 0.03;
export const BNR_RATES_URL = 'https://www.bnr.ro/nbrfxrates.xml';
/** BNR skips weekends/holidays — accept a cached rate up to this many days old. */
const MAX_RATE_AGE_DAYS = 4;

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
export async function getCurrentEurRate(): Promise<BnrEurRate> {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('exchange_rates')
    .select('date, rate')
    .eq('currency', 'EUR')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    const ageDays = (Date.now() - new Date(data.date).getTime()) / 86_400_000;
    if (ageDays <= MAX_RATE_AGE_DAYS) {
      return { date: data.date, rate: Number(data.rate) };
    }
  }

  const fresh = await fetchBnrEurRate();
  const { error } = await supabase
    .from('exchange_rates')
    .upsert({ date: fresh.date, currency: 'EUR', rate: fresh.rate });
  if (error) {
    // Cache write failure must not break pricing — log and serve the rate.
    console.error('exchange_rates upsert failed:', error.message);
  }
  return fresh;
}
