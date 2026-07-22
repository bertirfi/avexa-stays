// Quiet, Airbnb-style points-of-interest for the /locations map — small white
// badges that show visitors what sits near each suite. Purely decorative: they
// never intercept clicks and always render below the gold price pins.

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'monument' | 'museum' | 'park' | 'square' | 'station';
  /** Below this map zoom the marker is hidden entirely (keeps the edges calm). */
  minZoom?: number;
}

export const BUCHAREST_LANDMARKS: Landmark[] = [
  { id: 'ateneul-roman', name: 'Ateneul Român', lat: 44.4413, lng: 26.0973, kind: 'monument' },
  { id: 'palatul-parlamentului', name: 'Palatul Parlamentului', lat: 44.4275, lng: 26.0875, kind: 'monument' },
  { id: 'piata-universitatii', name: 'Piața Universității', lat: 44.4355, lng: 26.1025, kind: 'square' },
  { id: 'old-town-lipscani', name: 'Old Town — Lipscani', lat: 44.4308, lng: 26.1005, kind: 'monument' },
  { id: 'gradina-cismigiu', name: 'Grădina Cișmigiu', lat: 44.436, lng: 26.091, kind: 'park' },
  { id: 'piata-romana', name: 'Piața Romană', lat: 44.4453, lng: 26.0978, kind: 'square' },
  { id: 'piata-victoriei', name: 'Piața Victoriei', lat: 44.4522, lng: 26.0855, kind: 'square' },
  { id: 'piata-unirii', name: 'Piața Unirii', lat: 44.4268, lng: 26.1033, kind: 'square' },
  { id: 'gara-de-nord', name: 'Gara de Nord', lat: 44.4459, lng: 26.0705, kind: 'station' },
  { id: 'arcul-de-triumf', name: 'Arcul de Triumf', lat: 44.4672, lng: 26.0782, kind: 'monument', minZoom: 13 },
  { id: 'herastrau', name: 'Parcul Regele Mihai I / Herăstrău', lat: 44.472, lng: 26.0808, kind: 'park', minZoom: 13 },
  { id: 'muzeul-national-de-arta', name: 'Muzeul Național de Artă', lat: 44.4394, lng: 26.0958, kind: 'museum' },
];
