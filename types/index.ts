// ── Neighborhoods ──────────────────────────────────────────────
// AVEXA serves Bucharest City Center, divided into 4 zones.
export type NeighborhoodId =
  | 'calea-victoriei'
  | 'old-city-center'
  | 'universitate'
  | 'piata-romana';

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
  /** RON per night — money of record; convert only at display (lib/currency). */
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
  /** RON — money of record. */
  price: number;
  unit: '/day/person' | '';
  free: boolean;
}

export interface PropertyFAQ {
  q: string;
  a: string;
}

export type NearbyCategory =
  | 'Top Attractions'
  | 'Restaurants & Cafés'
  | 'Public Transit'
  | 'Closest Airports';

export interface PropertyNearby {
  category: NearbyCategory;
  name: string;
  distance: string;
}

export interface PropertyReview {
  author: string;
  location?: string;
  date: string;
  rating: number;
  body: string;
}

/** Categorized amenities — section title → list of items */
export type CategorizedAmenities = Record<string, string[]>;

export interface Property {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  neighborhood: NeighborhoodId;
  neighborhoodLabel: string;
  neighborhoodColor: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  stats: PropertyStat[];
  maxGuests: number;
  description: string;
  pitch?: string;
  goodToKnow?: string;
  checkin: string;
  checkout: string;
  cover: string; // shortcut to photos[0].src — relative path under /public
  photos: PropertyPhoto[];
  rates: PropertyRate[];
  upgrades: PropertyUpgrade[];
  amenitiesTop: string[];
  amenitiesProperty: CategorizedAmenities;
  amenitiesRoom: CategorizedAmenities;
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

// ── Booking (localStorage; UI-only optimistic cache) ───────────
// All money fields are RON (money of record). NEVER trusted server-side:
// /api/checkout re-derives price + identity from Hostaway + the session.
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
  /** Sibling property ids added via "Add room" (multi-room booking). */
  addedRoomIds?: string[];
}
