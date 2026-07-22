// Quiet, Airbnb-style points-of-interest for the /locations map — small white
// badges that show visitors what sits near each suite. Purely decorative: they
// never intercept clicks and always render below the gold price pins.
// Names use the established English forms (international audience).

export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'monument' | 'museum' | 'park' | 'square' | 'station' | 'airport' | 'restaurant';
  /** Below this map zoom the marker is hidden entirely (keeps the edges calm). */
  minZoom?: number;
}

export const BUCHAREST_LANDMARKS: Landmark[] = [
  { id: 'ateneul-roman', name: 'Romanian Athenaeum', lat: 44.4413, lng: 26.0973, kind: 'monument' },
  { id: 'palatul-parlamentului', name: 'Palace of the Parliament', lat: 44.4275, lng: 26.0875, kind: 'monument' },
  { id: 'piata-universitatii', name: 'University Square', lat: 44.4355, lng: 26.1025, kind: 'square' },
  { id: 'old-town-lipscani', name: 'Old Town — Lipscani', lat: 44.4308, lng: 26.1005, kind: 'monument' },
  { id: 'caru-cu-bere', name: "Caru' cu Bere", lat: 44.43135, lng: 26.09725, kind: 'restaurant' },
  { id: 'gradina-cismigiu', name: 'Cișmigiu Gardens', lat: 44.436, lng: 26.091, kind: 'park' },
  { id: 'parcul-izvor', name: 'Izvor Park', lat: 44.4295, lng: 26.0935, kind: 'park' },
  { id: 'piata-romana', name: 'Romană Square', lat: 44.4453, lng: 26.0978, kind: 'square' },
  { id: 'piata-victoriei', name: 'Victory Square', lat: 44.4522, lng: 26.0855, kind: 'square' },
  { id: 'piata-unirii', name: 'Unirii Square', lat: 44.4268, lng: 26.1033, kind: 'square' },
  { id: 'gara-de-nord', name: 'North Railway Station', lat: 44.4459, lng: 26.0705, kind: 'station' },
  { id: 'arcul-de-triumf', name: 'Arch of Triumph', lat: 44.4672, lng: 26.0782, kind: 'monument', minZoom: 13 },
  { id: 'herastrau', name: 'King Michael I Park (Herăstrău)', lat: 44.472, lng: 26.0808, kind: 'park', minZoom: 13 },
  { id: 'muzeul-national-de-arta', name: 'National Museum of Art', lat: 44.4394, lng: 26.0958, kind: 'museum' },
  // ~16.5km north of the centre — only meaningful when the visitor zooms out.
  { id: 'otopeni-airport', name: 'Henri Coandă International Airport', lat: 44.5711, lng: 26.085, kind: 'airport' },
];
