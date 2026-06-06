import type { Neighborhood } from '@/types';

/**
 * Bucharest neighborhoods served by AVEXA.
 * coverImage paths are placeholders pulled from existing listing-photos folder
 * until proper neighborhood hero shots are uploaded in Phase 3.
 */
export const neighborhoods: Neighborhood[] = [
  {
    id: 'centre',
    label: 'City Centre',
    area: 'Sector 1 & 3',
    color: '#2E7D32',
    coverImage: '/listing-photos/00-cover.jpeg',
    description: 'Heart of Bucharest. Old Town energy, Calea Victoriei elegance.',
    propertyCount: 8,
  },
  {
    id: 'floreasca',
    label: 'Floreasca',
    area: 'Sector 1',
    color: '#FF4136',
    coverImage: '/listing-photos/30-living-room.jpeg',
    description: 'Lakeside calm. Corporate towers meet sycamore-lined streets.',
    propertyCount: 0,
  },
  {
    id: 'pipera',
    label: 'Pipera',
    area: 'Sector 1',
    color: '#D4531A',
    coverImage: '/listing-photos/09-hallway.jpeg',
    description: 'Tech corridor. Modern apartment compounds near major HQs.',
    propertyCount: 0,
  },
  {
    id: 'dorobanti',
    label: 'Dorobanți',
    area: 'Sector 1',
    color: '#1565C0',
    coverImage: '/listing-photos/33-open-streets.jpeg',
    description: 'Diplomatic quarter. Quiet villas, boutique stays, embassies.',
    propertyCount: 0,
  },
  {
    id: 'herastrau',
    label: 'Herăstrău',
    area: 'Sector 1',
    color: '#6A1B9A',
    coverImage: '/listing-photos/30-living-room.jpeg',
    description: 'Park-side living. Biggest urban lake, Sunday brunches.',
    propertyCount: 0,
  },
  {
    id: 'baneasa',
    label: 'Băneasa',
    area: 'Sector 1',
    color: '#00695C',
    coverImage: '/listing-photos/00-cover.jpeg',
    description: 'Forest edge. Near the airport, suburban green respite.',
    propertyCount: 0,
  },
];

export function getNeighborhood(id: string): Neighborhood | undefined {
  return neighborhoods.find((n) => n.id === id);
}
