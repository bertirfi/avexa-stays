import type { Property } from '@/types';

/**
 * AVEXA properties — full data port deferred to Phase 3.
 * Phase 2 only needs the IDs + cover for homepage neighborhood counts.
 * Phase 3 will import the full data shape from stay-data-*.jsx into structured records here.
 */

interface PropertyStub {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  neighborhood: Property['neighborhood'];
  maxGuests: number;
  bedrooms: 'Studio' | '1 Bedroom' | '2 Bedrooms';
  address: string;
  cover: string;
  perNight: number;
}

export const properties: PropertyStub[] = [
  {
    id: '101',
    slug: 'the-little-gem',
    name: 'The Little Gem',
    subtitle: 'AVEXA Suite 101',
    neighborhood: 'centre',
    maxGuests: 2,
    bedrooms: 'Studio',
    address: 'Calea Victoriei 2, Sector 3',
    cover: '/listings/101/00-cover.jpeg',
    perNight: 79,
  },
  {
    id: '201',
    slug: 'the-golden-forest',
    name: 'The Golden Forest',
    subtitle: 'AVEXA Suite 201',
    neighborhood: 'centre',
    maxGuests: 4,
    bedrooms: '1 Bedroom',
    address: 'Calea Victoriei 2, Sector 3',
    cover: '/listings/201/00-cover.jpeg',
    perNight: 119,
  },
  {
    id: '202',
    slug: 'the-modern-green-gem',
    name: 'The Modern Green Gem',
    subtitle: 'AVEXA Suite 202',
    neighborhood: 'centre',
    maxGuests: 4,
    bedrooms: '1 Bedroom',
    address: 'Calea Victoriei 142-148, Sector 1',
    cover: '/listings/202/00-cover.jpeg',
    perNight: 129,
  },
  {
    id: '203',
    slug: 'the-modern-quartz-gem',
    name: 'The Modern Quartz Gem',
    subtitle: 'AVEXA Suite 203',
    neighborhood: 'centre',
    maxGuests: 4,
    bedrooms: '1 Bedroom',
    address: 'Colței 25, Sector 3',
    cover: '/listings/203/00-cover.jpeg',
    perNight: 119,
  },
  {
    id: '301',
    slug: 'the-grand-suite',
    name: 'The Grand Suite',
    subtitle: 'AVEXA Suite 301',
    neighborhood: 'centre',
    maxGuests: 4,
    bedrooms: '1 Bedroom',
    address: 'Calea Victoriei 142-148, Sector 1',
    cover: '/listing-photos/00-cover.jpeg',
    perNight: 149,
  },
  {
    id: '302',
    slug: 'the-modern-sapphire-gem',
    name: 'The Modern Sapphire Gem',
    subtitle: 'AVEXA Suite 302',
    neighborhood: 'centre',
    maxGuests: 6,
    bedrooms: '2 Bedrooms',
    address: 'Calea Victoriei 142-148, Sector 1',
    cover: '/listings/302/00-cover.jpeg',
    perNight: 175,
  },
  {
    id: '303',
    slug: 'the-modern-oak-gem',
    name: 'The Modern Oak Gem',
    subtitle: 'AVEXA Suite 303',
    neighborhood: 'centre',
    maxGuests: 6,
    bedrooms: '2 Bedrooms',
    address: 'Calea Victoriei 142-148, Sector 1',
    cover: '/listings/303/00-cover.jpeg',
    perNight: 175,
  },
  {
    id: '304',
    slug: 'central-quiet-luxury',
    name: 'Central Quiet Luxury',
    subtitle: 'AVEXA Suite 304',
    neighborhood: 'centre',
    maxGuests: 6,
    bedrooms: '2 Bedrooms',
    address: 'Polonă, Sector 1',
    cover: '/listings/304/00-cover.jpeg',
    perNight: 195,
  },
];

export function getProperty(idOrSlug: string): PropertyStub | undefined {
  return properties.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getPropertiesByNeighborhood(n: Property['neighborhood']): PropertyStub[] {
  return properties.filter((p) => p.neighborhood === n);
}
