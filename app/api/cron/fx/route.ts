import { NextResponse } from 'next/server';
import { fetchBnrRates } from '@/lib/fx';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { timingSafeEqualStrings } from '@/lib/timing-safe';

export const dynamic = 'force-dynamic';

/**
 * Daily BNR rate sync. Invoked by Vercel Cron (sends
 * `Authorization: Bearer ${CRON_SECRET}` automatically when the env var is
 * set) — cron registration in vercel.json happens at launch (Wave 7).
 * Manual trigger: GET with the same bearer token.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeEqualStrings(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { date, rates } = await fetchBnrRates();
    const { error } = await getSupabaseAdmin()
      .from('exchange_rates')
      .upsert([
        { date, currency: 'EUR', rate: rates.EUR },
        { date, currency: 'USD', rate: rates.USD },
      ]);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, date, rates });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('fx cron failed:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
