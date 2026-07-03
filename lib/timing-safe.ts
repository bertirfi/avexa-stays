import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string comparison, shared by every bearer-secret route so no
 * endpoint leaks secret bytes through compare timing. A plain `===` short-
 * circuits on the first differing byte, exposing the secret's length and prefix
 * to a timing attacker; timingSafeEqual compares the full buffers in constant
 * time. Length is not secret here (the secrets are fixed-length env values), so
 * we return false immediately on a length mismatch rather than pad.
 */
export function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
