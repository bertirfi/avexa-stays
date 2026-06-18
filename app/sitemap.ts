import type { MetadataRoute } from 'next';
import { properties } from '@/lib/properties';

const BASE_URL = 'https://avexastays.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/member-benefits`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const stayRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/locations/${property.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...stayRoutes];
}
