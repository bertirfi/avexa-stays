/**
 * Client decision 04.09: the guest never sees a separate cleaning line — the
 * per-stay fee is part of the displayed price. For the expandable per-night
 * list (M1.1.6) that means each night carries an equal share of the fee, with
 * the leftover lei on the first nights, so the nightly lines still sum EXACTLY
 * to the accommodation line shown. Pure, client-safe.
 */
export function foldIntoNights<T extends { ron: number }>(nights: T[], perStayRon: number): T[] {
  const n = nights.length;
  // Whole lei only — the exact-sum guarantee needs an integer leftover.
  const fee = Math.round(perStayRon);
  if (n === 0 || fee <= 0) return nights;
  const share = Math.floor(fee / n);
  const leftover = fee - share * n;
  return nights.map((night, i) => ({ ...night, ron: night.ron + share + (i < leftover ? 1 : 0) }));
}
