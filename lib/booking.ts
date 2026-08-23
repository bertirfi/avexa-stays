import { getProperty } from '@/lib/properties';
import { parseYmd } from '@/lib/date';
import type { Booking, Property, PropertyRate } from '@/types';

/**
 * Booking-draft localStorage helpers + hydration for the checkout flow.
 *
 * Scope: the `avexa_booking` draft ONLY — an optimistic, UI-only cache of the
 * suite/dates/guests the visitor picked, never trusted server-side (/api/checkout
 * re-derives price + identity from Hostaway + the Supabase session). Auth state is
 * NOT stored here: identity of record lives in the httpOnly Supabase session, and
 * client components read it via `useAuth()` (components/auth/AuthProvider.tsx).
 */

export interface HydratedBooking {
  raw: Booking;
  property: Property;
  rate: PropertyRate;
  checkInDate: Date;
  checkOutDate: Date;
}

const BOOKING_KEY = 'avexa_booking';

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

export function hydrate(b: Booking): HydratedBooking | null {
  const property = getProperty(b.propertyId);
  if (!property) return null;
  // Single flat rate since M1.1 (legacy drafts carried a rateId — ignored).
  const rate = property.rates[0];
  if (!rate) return null;
  // Parse 'YYYY-MM-DD' at LOCAL midnight (lib/date) — `new Date(str)` reads it as
  // UTC midnight, which shows the previous day for western (negative-offset) zones.
  const checkInDate = parseYmd(b.checkIn);
  const checkOutDate = parseYmd(b.checkOut);
  if (!checkInDate || !checkOutDate) return null;
  return {
    raw: b,
    property,
    rate,
    checkInDate,
    checkOutDate,
  };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

export function longDate(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}
