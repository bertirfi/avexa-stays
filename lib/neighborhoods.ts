import type { Neighborhood } from '@/types';
import { properties } from '@/lib/properties';

/**
 * AVEXA serves a single city — Bucharest City Center — divided into 4 zones.
 *
 * Each zone may have 1 or more suites:
 *   Calea Victoriei  → 301, 302, 303, 202 (4 suites)
 *   Old City Center  → 101, 201            (2 suites)
 *   Universitate     → 203                 (1 suite)
 *   Piața Romană     → 304                 (1 suite)
 *
 * `propertyCount` is derived live from the static catalog so the homepage
 * carousel can never drift from /locations (which counts the same source).
 * No import cycle: lib/properties.ts keeps its own local neighborhood map and
 * does not import this file.
 */
function countIn(id: Neighborhood['id']): number {
  return properties.filter((p) => p.neighborhood === id).length;
}

export const neighborhoods: Neighborhood[] = [
  {
    id: 'calea-victoriei',
    label: 'Calea Victoriei',
    area: 'Sector 1',
    color: '#2E7D32',
    // Open Streets evening on Calea Victoriei — pre-cropped copy: the original
    // has marketing lettering baked into the sky (uncroppable at card aspect).
    coverImage: '/listing-photos/33-open-streets-card.jpeg',
    description: 'Bucharest\'s most prestigious boulevard — palaces, boutiques, embassies.',
    propertyCount: countIn('calea-victoriei'),
  },
  {
    id: 'old-city-center',
    label: 'Old City Center',
    area: 'Sector 3',
    color: '#B08840',
    // The square at the Old Town gateway — suite 101/201's actual exterior view.
    coverImage: '/listings/101/23-exterior.jpeg',
    description: 'Historic core, Old Town energy, nightlife at your doorstep.',
    propertyCount: countIn('old-city-center'),
  },
  {
    id: 'universitate',
    label: 'Universitate',
    area: 'Sector 3',
    color: '#1565C0',
    // Rooftop streetscape — church tower + historic villas, the central grid.
    coverImage: '/listing-photos/31-bedroom2-view.jpeg',
    description: 'Central transit hub — Universitate metro, walkable everywhere.',
    propertyCount: countIn('universitate'),
  },
  {
    id: 'piata-romana',
    label: 'Piața Romană',
    area: 'Sector 1',
    color: '#6A1B9A',
    // Leafy courtyard path — the quiet, green residential feel of the pocket.
    coverImage: '/listing-photos/32-interior-courtyard.jpeg',
    description: 'Quiet residential pocket near Calea Victoriei and Romană metro.',
    propertyCount: countIn('piata-romana'),
  },
];

export function getNeighborhood(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
