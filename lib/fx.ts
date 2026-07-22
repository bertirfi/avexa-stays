/**
 * BNR rate MONITORING — NOT the pricing formula (that is lib/pricing.ts).
 *
 * The daily /api/cron/fx job records the real BNR EUR rate in Supabase purely
 * to monitor drift against our fixed display rates (AVEXA_FX_RATE_*). Nothing
 * guest-facing reads this module; never wire it into a price path.
 */
export const BNR_RATES_URL = 'https://www.bnr.ro/nbrfxrates.xml';

export interface BnrEurRate {
  /** Publication date, YYYY-MM-DD */
  date: string;
  /** RON per 1 EUR */
  rate: number;
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
