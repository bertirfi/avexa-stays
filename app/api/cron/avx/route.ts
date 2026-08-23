import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { timingSafeEqualStrings } from '@/lib/timing-safe';
import { computeProgress, TIER_PERCENT } from '@/lib/avx/tiers';
import { activationDate, earnForBooking, expireTranches } from '@/lib/avx/ledger';

export const dynamic = 'force-dynamic';

/**
 * Daily AVX sweep (Vercel Cron, 03:00 UTC — vercel.json). Two steps:
 *  (a) earn: every confirmed booking whose check_out + 24h has passed and
 *      that has no earn row yet gets one. The tier is computed at that
 *      stay's completion moment, INCLUDING the stay (M2.1.3), from the
 *      user's full booking history via computeProgress.
 *  (b) expire: sweep tranches past their 12-month expiry.
 * Fully idempotent (partial unique index on earn; expire zeroes first).
 * Degrades to `{ dark: true }` until 004_avx.sql has been run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeEqualStrings(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const admin = getSupabaseAdmin();
    const now = new Date();
    // check_out + 24h <= now  ⇔  check_out (date) <= UTC date of (now − 24h).
    const cutoffYmd = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

    // Bookings already rewarded — also our feature-dark probe (42P01).
    const earnedRes = await admin
      .from('avx_ledger')
      .select('booking_id')
      .eq('type', 'earn');
    if (earnedRes.error) {
      if (earnedRes.error.code === '42P01') {
        return NextResponse.json({ ok: true, dark: true });
      }
      throw new Error(earnedRes.error.message);
    }
    const earnedIds = new Set((earnedRes.data ?? []).map((r) => r.booking_id));

    const eligibleRes = await admin
      .from('bookings')
      .select('id, user_id, check_in, check_out, status, accommodation_ron')
      .eq('status', 'confirmed')
      .lte('check_out', cutoffYmd);
    if (eligibleRes.error) throw new Error(eligibleRes.error.message);

    const candidates = (eligibleRes.data ?? [])
      .filter((b) => !earnedIds.has(b.id))
      .sort((a, b) => a.check_out.localeCompare(b.check_out));

    // Full history per user (one query) — tier needs every booking, not just
    // the eligible ones. Cancelled/pending are filtered inside computeProgress.
    const userIds = [...new Set(candidates.map((b) => b.user_id))];
    const historyByUser = new Map<
      string,
      { check_in: string; check_out: string; status: string }[]
    >();
    if (userIds.length > 0) {
      const historyRes = await admin
        .from('bookings')
        .select('user_id, check_in, check_out, status')
        .in('user_id', userIds);
      if (historyRes.error) throw new Error(historyRes.error.message);
      for (const row of historyRes.data ?? []) {
        const list = historyByUser.get(row.user_id) ?? [];
        list.push(row);
        historyByUser.set(row.user_id, list);
      }
    }

    let earned = 0;
    let skipped = 0;
    let coins = 0;
    for (const booking of candidates) {
      const asOf = activationDate(booking.check_out);
      const progress = computeProgress(historyByUser.get(booking.user_id) ?? [], asOf);
      const percent = TIER_PERCENT[progress.tier];
      if (percent <= 0) {
        skipped += 1; // BASIC earns nothing — can't happen for a completed stay, but guard
        continue;
      }
      const result = await earnForBooking(
        { ...booking, accommodation_ron: Number(booking.accommodation_ron) },
        progress.tier,
        percent,
      );
      if (result === null) return NextResponse.json({ ok: true, dark: true });
      if (result.inserted) {
        earned += 1;
        coins += result.amount;
      } else {
        skipped += 1;
      }
    }

    const expired = await expireTranches(now);

    return NextResponse.json({ ok: true, earned, skipped, coins, expired: expired ?? 0 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error';
    console.error('avx cron failed:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
