/**
 * AVEXIAN tiers — the single source of truth for tier thresholds, earn
 * percentages, vault items and spend rules (Spec M2.2 / M2.5.3).
 *
 * Pure module: no imports, no I/O — unit-checkable with plain tsx and safe
 * to import from server components, the cron, and (metadata only) client bits.
 */

export type TierId = 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface TierMeta {
  id: TierId;
  /** Display name — DIAMOND renders as "Diamond Hero". */
  name: string;
  /** Minimum completed stays in the rolling 12 months (both conditions required). */
  minStays: number;
  /** Minimum nights in the rolling 12 months (both conditions required). */
  minNights: number;
  /** Earn % applied to the net accommodation base at stay completion (M2.1.3). */
  percent: number;
  /** Vault experiences INTRODUCED at this tier (cumulative up the ladder). */
  vaultItems: string[];
  /** Extra spending/benefit rule unlocked at this tier, if any. */
  spendNote: string | null;
}

/** Ordered ladder, BASIC → DIAMOND. Index = rank. */
export const TIERS: TierMeta[] = [
  {
    id: 'BASIC',
    name: 'Basic',
    minStays: 0,
    minNights: 0,
    percent: 0,
    vaultItems: [],
    spendNote: null,
  },
  {
    id: 'BRONZE',
    name: 'Bronze',
    minStays: 1,
    minNights: 0,
    percent: 5,
    vaultItems: [],
    spendNote: null,
  },
  {
    id: 'SILVER',
    name: 'Silver',
    minStays: 2,
    minNights: 5,
    percent: 8,
    vaultItems: ['Early Check-in', 'Late Check-out'],
    spendNote: null,
  },
  {
    id: 'GOLD',
    name: 'Gold',
    minStays: 3,
    minNights: 10,
    percent: 10,
    vaultItems: [
      'Welcome Box',
      'Luggage Drop',
      'Mid-stay Cleaning',
      'Birthday & Anniversary Packages',
    ],
    spendNote: null,
  },
  {
    id: 'PLATINUM',
    name: 'Platinum',
    minStays: 5,
    minNights: 20,
    percent: 12.5,
    vaultItems: ['24/7 Parking', 'Airport Transfer', 'Spa & Relaxation Kit'],
    spendNote: 'Pay accommodation with AVX at 2 AVX = 1 RON',
  },
  {
    id: 'DIAMOND',
    name: 'Diamond Hero',
    minStays: 7,
    minNights: 35,
    percent: 15,
    vaultItems: ['All upsells free (subject to availability)', 'Physical gift'],
    spendNote: 'Every upsell on the house, subject to availability',
  },
];

/** Earn % by tier id — convenience map derived from TIERS. */
export const TIER_PERCENT: Record<TierId, number> = Object.fromEntries(
  TIERS.map((t) => [t.id, t.percent]),
) as Record<TierId, number>;

export function tierMeta(id: TierId): TierMeta {
  // TIERS is a closed set — the find can never miss for a TierId.
  return TIERS.find((t) => t.id === id) as TierMeta;
}

export function tierRank(id: TierId): number {
  return TIERS.findIndex((t) => t.id === id);
}

/** Minimal booking shape computeProgress needs (subset of the bookings row). */
export interface ProgressBooking {
  check_in: string; // 'YYYY-MM-DD'
  check_out: string; // 'YYYY-MM-DD'
  status: string;
}

export interface TierProgress {
  /** Completed stays in the rolling 12 months, back-to-back chains merged. */
  stays: number;
  /** Nights across those stays (nights of every merged leg summed). */
  nights: number;
  tier: TierId;
  /** Next rung up, or null at DIAMOND. */
  next: {
    tier: TierId;
    /** Additional stays still required (0 when the stays condition is met). */
    staysNeeded: number;
    nightsNeeded: number;
    /** Absolute thresholds — handy for progress bars. */
    staysTarget: number;
    nightsTarget: number;
  } | null;
}

function ymdParts(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = ymdParts(checkIn);
  const b = ymdParts(checkOut);
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** 'YYYY-MM-DD' for a Date in Bucharest time (the repo's day convention). */
function bucharestYmd(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(date);
}

/** Same calendar day 12 months earlier, as 'YYYY-MM-DD' (Date.UTC clamps overflow). */
function twelveMonthsBefore(ymd: string): string {
  const { y, m, d } = ymdParts(ymd);
  const t = new Date(Date.UTC(y - 1, m - 1, d));
  return t.toISOString().slice(0, 10);
}

/**
 * Tier progression from a user's raw bookings (M2.2 + M2.3).
 *
 * - Only completed stays count: status 'confirmed' AND check_out <= today
 *   (Bucharest). Cancelled/pending never count.
 * - Rolling 12 months: stays whose check_out falls within the last 12 months.
 * - Back-to-back merge (M2.3.1): consecutive bookings with no free day
 *   between them (next.check_in <= chain check_out), any property → ONE stay;
 *   nights of every leg sum, the chain counts once.
 * - Tier: highest rung whose BOTH conditions (stays & nights) are met.
 *
 * Pure given `now` — the cron passes each stay's completion moment so the
 * tier is computed "including that stay" (M2.1.3).
 */
export function computeProgress(
  bookings: ProgressBooking[],
  now: Date = new Date(),
): TierProgress {
  const today = bucharestYmd(now);
  const cutoff = twelveMonthsBefore(today);

  const completed = bookings
    .filter(
      (b) =>
        b.status === 'confirmed' && b.check_out <= today && b.check_out > cutoff,
    )
    .sort((a, b) => (a.check_in < b.check_in ? -1 : a.check_in > b.check_in ? 1 : 0));

  let stays = 0;
  let nights = 0;
  let chainEnd = ''; // check_out of the running back-to-back chain

  for (const b of completed) {
    if (stays === 0 || b.check_in > chainEnd) {
      stays += 1; // free day (or first booking) → new stay
      chainEnd = b.check_out;
    } else if (b.check_out > chainEnd) {
      chainEnd = b.check_out; // back-to-back → extend the chain
    }
    nights += nightsBetween(b.check_in, b.check_out);
  }

  let tier: TierId = 'BASIC';
  for (const t of TIERS) {
    if (stays >= t.minStays && nights >= t.minNights) tier = t.id;
  }

  const rank = tierRank(tier);
  const nextMeta = rank + 1 < TIERS.length ? TIERS[rank + 1] : null;

  return {
    stays,
    nights,
    tier,
    next: nextMeta
      ? {
          tier: nextMeta.id,
          staysNeeded: Math.max(0, nextMeta.minStays - stays),
          nightsNeeded: Math.max(0, nextMeta.minNights - nights),
          staysTarget: nextMeta.minStays,
          nightsTarget: nextMeta.minNights,
        }
      : null,
  };
}
