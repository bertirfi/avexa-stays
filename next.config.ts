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
    // quality={85} is used on hero/editorial imagery; Next 16 hard-errors on
    // qualities missing from this allowlist (Next 15 only warns).
    qualities: [75, 85],
  },
  // Ignore legacy HTML/JSX prototype files at project root from build
  pageExtensions: ['ts', 'tsx'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Property pages moved from /stays/* to /locations/* (hub → detail).
    // 301 keeps any old/bookmarked link alive and consolidates SEO signals.
    return [
      { source: '/stays/:slug', destination: '/locations/:slug', permanent: true },
    ];
  },
};

export default config;
