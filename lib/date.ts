/** Local calendar-day key 'YYYY-MM-DD' (matches Supabase `date` columns).
 *  Uses local Y/M/D — NOT toISOString — to avoid timezone day-shifts. */
export function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
