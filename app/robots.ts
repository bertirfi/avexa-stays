import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Defense-in-depth: every non-production deploy (preview/dev) disallows all
  // crawling. Vercel already sends `x-robots-tag: noindex` on preview URLs, but
  // a stray preview must never rank — so we block '/' outright there and keep
  // the real allow/disallow rules for production only.
  if (process.env.VERCEL_ENV !== 'production') {
    return {
      rules: { userAgent: '*', disallow: '/' },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/my-trips', '/profile'],
    },
    sitemap: 'https://avexastays.com/sitemap.xml',
  };
}
