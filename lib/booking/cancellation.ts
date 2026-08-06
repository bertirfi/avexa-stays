/**
 * Free-cancellation policy — single source of truth, shared by the My Trips
 * page (shows/hides the cancel button) and the cancel server action (enforces
 * it). Mirrors the PUBLISHED policy (/cancellation) exactly:
 *
 *   "Flexible Rate: free cancellation up to 48 hours before your scheduled
 *    arrival date (by 3:00 PM, local time)."
 *
 * Deadline = (check-in day at 15:00 Europe/Bucharest) − 48h.
 */

const CHECK_IN_HOUR_BUCHAREST = 15;
const FREE_CANCEL_HOURS = 48;

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

/** Epoch ms after which a Flexible booking is no longer freely cancellable. */
export function freeCancelDeadlineMs(checkIn: string): number {
  const [y, m, d] = checkIn.split('-').map(Number);
  return (
    bucharestWallTimeMs(y, m, d, CHECK_IN_HOUR_BUCHAREST) - FREE_CANCEL_HOURS * 3_600_000
  );
}

/**
 * Whether the guest can self-cancel with a full refund right now.
 * Requires: a confirmed booking, the Flexible rate, a PMS reservation to
 * cancel, and the published 48h/15:00 deadline not yet passed.
 */
export function isFreeCancellable(
  booking: {
    status: string;
    rate_plan: string;
    check_in: string;
    hostaway_reservation_id: string | null;
  },
  nowMs: number = Date.now(),
): boolean {
  return (
    booking.status === 'confirmed' &&
    booking.rate_plan === 'flexible' &&
    booking.hostaway_reservation_id !== null &&
    nowMs < freeCancelDeadlineMs(booking.check_in)
  );
}
