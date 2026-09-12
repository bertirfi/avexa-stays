/**
 * BNR daily rates (EUR + USD) — fed into `exchange_rates` by /api/cron/fx and
 * read by lib/fx-rates.ts for the live DISPLAY conversion (D11: previous-day
 * BNR rate +1%). Never a charge path: Stripe/Hostaway stay in RON.
 */
// curs.bnr.ro since 2026 — the old www.bnr.ro/nbrfxrates.xml now redirects to the homepage.
export const BNR_RATES_URL = 'https://curs.bnr.ro/nbrfxrates.xml';

export interface BnrRates {
  /** Publication date, YYYY-MM-DD */
  date: string;
  /** RON per 1 unit */
  rates: { EUR: number; USD: number };
}

function parseRate(xml: string, currency: 'EUR' | 'USD'): number {
  const m = xml.match(
    new RegExp(`<Rate currency="${currency}"(?:\\s+multiplier="(\\d+)")?>([\\d.]+)</Rate>`),
  );
  if (!m) throw new Error(`BNR XML parse failed for ${currency} — format changed?`);
  const rate = Number(m[2]) / (m[1] ? Number(m[1]) : 1);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error(`BNR ${currency} rate invalid: ${m[2]}`);
  return rate;
}

/**
 * Fetch today's EUR and USD rates from BNR. The XML format has been stable
 * for years: <Cube date="YYYY-MM-DD"><Rate currency="EUR">4.97</Rate>...
 */
export async function fetchBnrRates(): Promise<BnrRates> {
  const res = await fetch(BNR_RATES_URL, {
    headers: { 'user-agent': 'avexa-stays/1.0 (fx sync)' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BNR fetch failed: HTTP ${res.status}`);
  const xml = await res.text();

  const date = xml.match(/<Cube date="(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (!date) throw new Error('BNR XML parse failed — format changed?');
  return { date, rates: { EUR: parseRate(xml, 'EUR'), USD: parseRate(xml, 'USD') } };
}
