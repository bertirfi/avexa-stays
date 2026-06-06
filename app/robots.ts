import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/my-trips', '/profile'],
    },
    sitemap: 'https://avexastays.com/sitemap.xml',
  };
}
