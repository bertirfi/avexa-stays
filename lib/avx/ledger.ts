/**
 * AVX ledger reads/writes — server-only (service-role client; writes bypass
 * RLS on purpose, the table has no insert/update policies).
 *
 * Every function is fail-soft on 42P01 (relation does not exist): the
 * 004_avx.sql migration is run manually by Robert, so until then the feature
 * stays dark — pages render a placeholder, the cron reports `dark: true`.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { TierId } from '@/lib/avx/tiers';

export interface AvxTranche {
  /** Unspent AVX in this tranche. */
  amount: number;
  /** ISO timestamp — when the tranche activates (pending) or expires (active). */
  at: string;
}

export interface AvxWalletData {
  /** Spendable AVX right now: active, non-expired `remaining` summed. */
  balance: number;
  /** Earned but not yet active (check_out + 24h in the future). */
  pending: AvxTranche[];
  /** Active tranches with their expiry, soonest first. */
  active: AvxTranche[];
}

interface PgError {
  code?: string;
}

const MISSING_TABLE = '42P01';

/** Earn-row eligibility gate: coins activate 24h after check-out (M2.4.1). */
export function activationDate(checkOut: string): Date {
  const [y, m, d] = checkOut.split('-').map(Number);
  // ponytail: check_out is a calendar date — "check-out + 24h" is anchored at
  // date-midnight UTC; the daily cron granularity makes finer precision moot.
  return new Date(Date.UTC(y, m - 1, d) + 24 * 3_600_000);
}

/** Expiry: 12 months after activation (M2.4.2). */
export function expiryDate(activatesAt: Date): Date {
  const t = new Date(activatesAt);
  t.setUTCFullYear(t.getUTCFullYear() + 1);
  return t;
}

/**
 * Wallet snapshot for the My Trips page. Returns null when the feature is
 * dark (table missing or admin env not configured) — callers render the
 * "being prepared" state.
 */
export async function getWallet(userId: string): Promise<AvxWalletData | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('avx_ledger')
      .select('remaining, activates_at, expires_at')
      .eq('user_id', userId)
      .eq('type', 'earn')
      .gt('remaining', 0)
      .order('activates_at', { ascending: true });

    if (error) {
      if ((error as PgError).code === MISSING_TABLE) return null;
      throw new Error(error.message);
    }

    const now = Date.now();
    const wallet: AvxWalletData = { balance: 0, pending: [], active: [] };

    for (const row of data ?? []) {
      const remaining = row.remaining ?? 0;
      const activates = row.activates_at ? Date.parse(row.activates_at) : 0;
      const expires = row.expires_at ? Date.parse(row.expires_at) : Infinity;
      if (expires <= now) continue; // overdue tranche the cron hasn't swept yet
      if (activates > now) {
        wallet.pending.push({ amount: remaining, at: row.activates_at as string });
      } else {
        wallet.balance += remaining;
        wallet.active.push({ amount: remaining, at: row.expires_at as string });
      }
    }
    wallet.active.sort((a, b) => a.at.localeCompare(b.at));
    return wallet;
  } catch (e) {
    // Admin env missing in this environment, or table dark — degrade, don't crash.
    console.error('getWallet failed:', e instanceof Error ? e.message : e);
    return null;
  }
}

export interface EarnableBooking {
  id: string;
  user_id: string;
  check_out: string;
  accommodation_ron: number;
}

/**
 * Insert the earn row for a completed booking. Idempotent: the partial
 * unique index (one earn per booking) turns a retry into a no-op (23505).
 *
 * Earn formula (M2.1.2/M2.1.3): base = round(accommodation_ron / 1.11)
 * (strips the included 11% VAT), amount = round(base × percent / 100).
 */
export async function earnForBooking(
  booking: EarnableBooking,
  tier: TierId,
  percent: number,
): Promise<{ inserted: boolean; amount: number } | null> {
  const earnBase = Math.round(booking.accommodation_ron / 1.11);
  const amount = Math.round((earnBase * percent) / 100);
  const activatesAt = activationDate(booking.check_out);

  const { error } = await getSupabaseAdmin().from('avx_ledger').insert({
    user_id: booking.user_id,
    booking_id: booking.id,
    type: 'earn',
    amount,
    remaining: amount,
    tier,
    percent,
    activates_at: activatesAt.toISOString(),
    expires_at: expiryDate(activatesAt).toISOString(),
  });

  if (error) {
    const code = (error as PgError).code;
    if (code === MISSING_TABLE) return null;
    if (code === '23505') return { inserted: false, amount }; // already earned
    throw new Error(error.message);
  }
  return { inserted: true, amount };
}

/**
 * Sweep expired tranches: for every earn row past expiry with remaining > 0,
 * write a compensating 'expire' row and zero the tranche.
 * Returns the number of tranches expired, or null when the feature is dark.
 */
export async function expireTranches(now: Date = new Date()): Promise<number | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('avx_ledger')
    .select('id, user_id, booking_id, remaining')
    .eq('type', 'earn')
    .gt('remaining', 0)
    .lte('expires_at', now.toISOString());

  if (error) {
    if ((error as PgError).code === MISSING_TABLE) return null;
    throw new Error(error.message);
  }

  let expired = 0;
  // ponytail: sequential, non-transactional sweep — volumes are tiny and the
  // daily cron re-runs; move to a SQL function if tranche counts ever matter.
  // Zero the tranche FIRST: balance derives from `remaining`, the expire row
  // is audit-only — a crash between the two can't inflate anyone's balance.
  for (const row of data ?? []) {
    const { error: updateError } = await admin
      .from('avx_ledger')
      .update({ remaining: 0 })
      .eq('id', row.id)
      .gt('remaining', 0);
    if (updateError) throw new Error(updateError.message);

    const { error: insertError } = await admin.from('avx_ledger').insert({
      user_id: row.user_id,
      booking_id: row.booking_id,
      type: 'expire',
      amount: -(row.remaining ?? 0),
      note: `expired tranche ${row.id}`,
    });
    if (insertError) throw new Error(insertError.message);
    expired += 1;
  }
  return expired;
}
