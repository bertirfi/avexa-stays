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
    // Open Streets evening on Calea Victoriei — string lights, street piano.
    coverImage: '/cartiere/calea-victoriei.jpg',
    description: 'Bucharest\'s most prestigious boulevard — palaces, boutiques, embassies.',
    propertyCount: countIn('calea-victoriei'),
  },
  {
    id: 'old-city-center',
    label: 'Old City Center',
    area: 'Sector 3',
    color: '#B08840',
    // Cobbled Old Town lane with terraces in bloom (Caru' cu Bere corner).
    coverImage: '/cartiere/old-city-center.jpg',
    description: 'Historic core, Old Town energy, nightlife at your doorstep.',
    propertyCount: countIn('old-city-center'),
  },
  {
    id: 'universitate',
    label: 'Universitate',
    area: 'Sector 3',
    color: '#1565C0',
    // The National Theatre at sunset — the Universitate square itself.
    coverImage: '/cartiere/universitate.jpg',
    // Don't repeat the card's own title in the copy — reads as duplicated text
    // under the heading (client review 24.08).
    description: 'Central transit hub — metro at the door, walkable everywhere.',
    propertyCount: countIn('universitate'),
  },
  {
    id: 'piata-romana',
    label: 'Piața Romană',
    area: 'Sector 1',
    color: '#6A1B9A',
    // Tree-canopied residential street — tall portrait shot, so bias the crop
    // upward to keep the green canopy in frame instead of the asphalt.
    coverImage: '/cartiere/piata-romana.jpg',
    coverPosition: 'center 40%',
    // Same rule: no "Romană" in the copy right under the "Piața Romană" title.
    description: 'Quiet residential pocket near Calea Victoriei, steps from the metro.',
    propertyCount: countIn('piata-romana'),
  },
];

export function getNeighborhood(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
