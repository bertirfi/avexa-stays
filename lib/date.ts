/** Local calendar-day key 'YYYY-MM-DD' (matches Supabase `date` columns).
 *  Uses local Y/M/D — NOT toISOString — to avoid timezone day-shifts. */
export function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse 'YYYY-MM-DD' into a LOCAL Date (midnight), inverse of ymd(). */
export function parseYmd(s: string | null | undefined): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
