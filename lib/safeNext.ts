/**
 * Sanitize a post-auth redirect target. Only same-origin absolute paths are
 * allowed — rejects `//evil.com`, `/\evil.com`, and any scheme-bearing value —
 * so a crafted `?next=` cannot bounce the user off-site after login.
 */
export function safeNext(raw: string | null | undefined, fallback = '/my-trips'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return fallback;
  }
  return raw;
}
