// ── Neighborhoods ──────────────────────────────────────────────
export type NeighborhoodId =
  | 'centre'
  | 'floreasca'
  | 'pipera'
  | 'dorobanti'
  | 'herastrau'
  | 'baneasa';

export interface Neighborhood {
  id: NeighborhoodId;
  label: string;
  area: string;
  color: string; // hex from --color-nbh-*
  coverImage: string; // path under /public
  description: string;
  propertyCount: number;
}

// ── Properties ─────────────────────────────────────────────────
export type StatIcon = 'users' | 'bed' | 'sofa' | 'bath';

export interface PropertyStat {
  icon: StatIcon;
  label: string;
}

export interface PropertyPhoto {
  id: number;
  label: string;
  src: string;
}

export interface PropertyRate {
  id: 'saver' | 'flex';
  name: string;
  perNight: number;
  discount: number;
  refundable: boolean;
  perks: string[];
  warn?: string;
  highlight?: string;
  cancelNote?: string;
}

export interface PropertyUpgrade {
  id: 'breakfast' | 'late_checkout' | 'early_checkin';
  name: string;
  price: number;
  unit: '/day/person' | '';
  free: boolean;
}

export interface PropertyFAQ {
  q: string;
  a: string;
}

export interface PropertyNearby {
  category: 'attraction' | 'restaurant' | 'transit' | 'airport';
  name: string;
  distance: string;
}

export interface PropertyReview {
  author: string;
  date: string;
  rating: number;
  body: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  neighborhood: NeighborhoodId;
  address: string;
  coordinates?: { lat: number; lng: number };
  stats: PropertyStat[];
  maxGuests: number;
  description: string;
  pitch?: string;
  checkin: string;
  checkout: string;
  cover: string; // shortcut to photos[0].src
  photos: PropertyPhoto[];
  rates: PropertyRate[];
  upgrades: PropertyUpgrade[];
  amenitiesTop: string[];
  amenitiesProperty: string[];
  amenitiesRoom: string[];
  faqs: PropertyFAQ[];
  nearby: PropertyNearby[];
  reviews: PropertyReview[];
}

// ── Search state (URL-driven) ──────────────────────────────────
export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchParams {
  location?: string;
  checkIn?: string; // ISO date
  checkOut?: string;
  guests?: GuestCounts;
}

// ── Auth stub (localStorage) ───────────────────────────────────
export interface AuthUser {
  loggedIn: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// ── Booking (localStorage during Phase 2) ──────────────────────
export interface Booking {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: GuestCounts;
  rateId: 'saver' | 'flex';
  upgrades: Record<string, boolean>;
  pricePerNight: number;
  subtotal: number;
  discount: number;
  breakfastTotal: number;
  cityTax: number;
  total: number;
}
