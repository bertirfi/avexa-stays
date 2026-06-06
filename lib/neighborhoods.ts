import type { Neighborhood } from '@/types';

/**
 * AVEXA serves a single city — Bucharest City Center — divided into 4 zones.
 *
 * Each zone may have 1 or more suites:
 *   Calea Victoriei  → 301, 302, 303, 202 (4 suites)
 *   Old City Center  → 101, 201            (2 suites)
 *   Universitate     → 203                 (1 suite)
 *   Piața Romană     → 304                 (1 suite)
 */
export const neighborhoods: Neighborhood[] = [
  {
    id: 'calea-victoriei',
    label: 'Calea Victoriei',
    area: 'Sector 1',
    color: '#2E7D32',
    coverImage: '/listings/301/00-cover.jpeg',
    description: 'Bucharest\'s most prestigious boulevard — palaces, boutiques, embassies.',
    propertyCount: 4,
  },
  {
    id: 'old-city-center',
    label: 'Old City Center',
    area: 'Sector 3',
    color: '#B08840',
    coverImage: '/listings/101/00-cover.jpeg',
    description: 'Historic core, Old Town energy, nightlife at your doorstep.',
    propertyCount: 2,
  },
  {
    id: 'universitate',
    label: 'Universitate',
    area: 'Sector 3',
    color: '#1565C0',
    coverImage: '/listings/203/00-cover.jpeg',
    description: 'Central transit hub — Universitate metro, walkable everywhere.',
    propertyCount: 1,
  },
  {
    id: 'piata-romana',
    label: 'Piața Romană',
    area: 'Sector 1',
    color: '#6A1B9A',
    coverImage: '/listings/304/00-cover.jpeg',
    description: 'Quiet residential pocket near Calea Victoriei and Romană metro.',
    propertyCount: 1,
  },
];

export function getNeighborhood(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
