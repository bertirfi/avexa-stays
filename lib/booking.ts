import { getProperty } from '@/lib/properties';
import type { Booking, Property, PropertyRate } from '@/types';

export interface HydratedBooking {
  raw: Booking;
  property: Property;
  rate: PropertyRate;
  checkInDate: Date;
  checkOutDate: Date;
}

const BOOKING_KEY = 'avexa_booking';
const USER_KEY = 'avexa_user';
const HAS_TRIPS_KEY = 'avexa_has_trips';

export function readBooking(): Booking | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BOOKING_KEY);
    return raw ? (JSON.parse(raw) as Booking) : null;
  } catch {
    return null;
  }
}

export function writeBooking(b: Booking) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BOOKING_KEY, JSON.stringify(b));
  } catch {}
}

export function clearBooking() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(BOOKING_KEY);
  } catch {}
}

export function markHasTrips() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HAS_TRIPS_KEY, 'true');
  } catch {}
}

export interface StoredUser {
  loggedIn: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // legacy combined name
}

export function readUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function hydrate(b: Booking): HydratedBooking | null {
  const property = getProperty(b.propertyId);
  if (!property) return null;
  const rate = property.rates.find((r) => r.id === b.rateId) ?? property.rates[0];
  if (!rate) return null;
  return {
    raw: b,
    property,
    rate,
    checkInDate: new Date(b.checkIn),
    checkOutDate: new Date(b.checkOut),
  };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

export function longDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

export function generateConfirmationId() {
  const part = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `AVX-${part}`;
}
