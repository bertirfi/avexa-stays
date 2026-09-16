/** Local calendar-day key 'YYYY-MM-DD' (matches Supabase `date` columns).
 *  Uses local Y/M/D — NOT toISOString — to avoid timezone day-shifts. */
export function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * A wall-clock hour on a 'YYYY-MM-DD' date in Europe/Bucharest, as epoch ms
 * (check-in 15:00, check-out 11:00). Bucharest is UTC+3 (summer) / UTC+2
 * (winter): the offset in force on that date comes from Intl — no library.
 */
export function bucharestMs(date: string, hour: number): number {
  const [y, m, d] = date.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 12, 0, 0);
  const local = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Bucharest',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(new Date(guess))
    .find((p) => p.type === 'timeZoneName')?.value;
  const offsetHours = Number(local?.replace('GMT', '') || 2);
  return Date.UTC(y, m - 1, d, hour - offsetHours, 0, 0);
}

/** Parse 'YYYY-MM-DD' into a LOCAL Date (midnight), inverse of ymd(). */
export function parseYmd(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
