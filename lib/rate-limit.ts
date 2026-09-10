// ponytail: per-instance in-memory bucket. Vercel fans requests out across
// instances, so this is a speed bump against naive loops, not a wall —
// upgrade path: a Vercel WAF rate-limit rule (or Upstash) on the same routes.
const buckets = new Map<string, { n: number; reset: number }>();
const MAX_KEYS = 10_000;

/** True when `key:ip` exceeded `limit` requests in the current `windowMs`. */
export function rateLimited(req: Request, key: string, limit: number, windowMs = 60_000): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const k = `${key}:${ip}`;
  const now = Date.now();
  const b = buckets.get(k);
  if (!b || b.reset < now) {
    if (buckets.size >= MAX_KEYS) buckets.clear();
    buckets.set(k, { n: 1, reset: now + windowMs });
    return false;
  }
  b.n += 1;
  return b.n > limit;
}
