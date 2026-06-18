import type { NextConfig } from 'next';

// Baseline security headers applied to every route.
// NOTE: Content-Security-Policy is intentionally deferred — a correct CSP needs
// the full third-party origin set (Google Maps, Stripe, Supabase, analytics) and
// nonce middleware for Next's inline hydration scripts. Add at launch hardening.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), browsing-topics=()' },
];

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Ignore legacy HTML/JSX prototype files at project root from build
  pageExtensions: ['ts', 'tsx'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
