/**
 * Sanitize a post-auth redirect target. Only same-origin absolute paths are
 * allowed — rejects `//evil.com`, `/\evil.com`, and any scheme-bearing value —
 * so a crafted `?next=` cannot bounce the user off-site after login.
 *
 * Positive check (allowlist, not blocklist): resolve the raw value against a
 * throwaway base and accept it ONLY if it starts with '/', stayed on that base
 * origin (i.e. it was a plain relative path), and is not a protocol-relative
 * `//host` form. Anything else falls back.
 */
export function safeNext(raw: string | null | undefined, fallback = '/my-trips'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  try {
    const url = new URL(raw, 'http://x');
    if (url.origin !== 'http://x') return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
