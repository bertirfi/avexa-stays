/**
 * Tiered cancellation policy (DX7 / M1.3) — single source of truth, shared by
 * the My Trips page (shows the applicable refund) and the cancel server action
 * (enforces it). Cancellation is a MEMBERSHIP right, not a rate tier — every
 * site booking qualifies, regardless of the historical rate_plan value
 * ('flexible', 'non_refundable', legacy 'saver'/'flex', or future 'standard').
 *
 * Anchor = check-in day 15:00 Europe/Bucharest. From `now`:
 *   ≥ 72h before the anchor → 100% refund
 *   ≥ 24h before the anchor →  50% refund
 *   under 24h / no-show     →   0%
 * City tax is ALWAYS refunded in full on any cancellation (handled by the
 * caller — this module only grades the accommodation+extras portion).
 * Copy lives in lib/policies.ts (CANCELLATION_POLICY) — keep them in lockstep.
 */

const CHECK_IN_HOUR_BUCHAREST = 15;
const FULL_REFUND_HOURS = 72;
const HALF_REFUND_HOURS = 24;

/**
 * Epoch ms of `y-m-d h:00` interpreted as Europe/Bucharest wall time.
 * Standard Intl round-trip: render a UTC guess in the target zone and correct
 * by the difference — exact for all non-DST-ambiguous times (a cancellation
 * deadline at 15:00 is never inside the 03:00–04:00 transition window).
 */
function bucharestWallTimeMs(y: number, m: number, d: number, h: number): number {
  const utcGuess = Date.UTC(y, m - 1, d, h);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Bucharest',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(utcGuess));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  // hour12:false can render midnight as "24" — normalize.
  const rendered = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'));
  return utcGuess - (rendered - utcGuess);
}

/**
 * Deadline = 15:00 Bucharest WALL TIME on (check-in − N days), not a flat
 * hour subtraction from one epoch — a DST switch between deadline and
 * check-in would otherwise shift the real cutoff an hour off the published
 * "until 15:00" framing.
 */
function wallDeadlineMs(checkIn: string, daysBefore: number): number {
  const [y, m, d] = checkIn.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d - daysBefore));
  return bucharestWallTimeMs(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    CHECK_IN_HOUR_BUCHAREST,
  );
}

/** Epoch ms until which cancelling refunds 100% (15:00, 3 days before check-in). */
export function fullRefundDeadlineMs(checkIn: string): number {
  return wallDeadlineMs(checkIn, FULL_REFUND_HOURS / 24);
}

/** Epoch ms until which cancelling refunds 50% (15:00, 1 day before check-in). */
export function halfRefundDeadlineMs(checkIn: string): number {
  return wallDeadlineMs(checkIn, HALF_REFUND_HOURS / 24);
}

/** Refund percentage of the non-city-tax portion if cancelled at `nowMs`. */
export function refundPercentFor(checkIn: string, nowMs: number = Date.now()): 100 | 50 | 0 {
  if (nowMs <= fullRefundDeadlineMs(checkIn)) return 100;
  if (nowMs <= halfRefundDeadlineMs(checkIn)) return 50;
  return 0;
}

/**
 * Whether the guest can self-cancel with SOME refund right now.
 * Requires: a confirmed booking, a PMS reservation to cancel, and a refund
 * tier > 0. No rate_plan gate — cancellation is a membership right (DX7).
 */
export function isSelfCancellable(
  booking: {
    status: string;
    check_in: string;
    hostaway_reservation_id: string | null;
  },
  nowMs: number = Date.now(),
): boolean {
  return (
    booking.status === 'confirmed' &&
    booking.hostaway_reservation_id !== null &&
    refundPercentFor(booking.check_in, nowMs) > 0
  );
}
