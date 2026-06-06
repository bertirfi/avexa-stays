/**
 * Mock trips data for the demo /my-trips page.
 * When the user is "logged in" and `localStorage.avexa_has_trips === 'true'`,
 * these are rendered as upcoming + past stays.
 *
 * NOTE: dates and properties are placeholder strings ported verbatim from
 * the Claude Design mockup (my-trips.html). They intentionally reference
 * neighborhoods that no longer match the 4-zone model — kept as-is to
 * preserve the original demo content; refine in a later pass if needed.
 */

export interface MockTrip {
  id: string;
  group: 'upcoming' | 'past';
  neighborhood: string;
  neighborhoodColor: string;
  dateRange: string;
  propertyName: string;
  details: string;
  totalPrice: string;
  perNightRate: string;
  status: 'Confirmed' | 'Completed';
  checkInTime?: string;
  checkOutTime?: string;
  doorCodeStatus?: string;
}

export const mockTrips: MockTrip[] = [
  {
    id: 't-floreasca-jun',
    group: 'upcoming',
    neighborhood: 'Floreasca',
    neighborhoodColor: '#FF4136',
    dateRange: 'Jun 12 — Jun 16, 2026',
    propertyName: 'The Floreasca Loft',
    details: '1 bedroom · 2 guests · 4 nights',
    totalPrice: '€ 506',
    perNightRate: '€ 126.50 / night · Member rate',
    status: 'Confirmed',
    checkInTime: 'Jun 12, 3:00 PM',
    checkOutTime: 'Jun 16, 1:00 PM',
    doorCodeStatus: 'Sent 24h before',
  },
  {
    id: 't-centre-apr',
    group: 'past',
    neighborhood: 'City Centre',
    neighborhoodColor: '#2E7D32',
    dateRange: 'Apr 28 — May 01, 2026',
    propertyName: 'Centre Studio — Lipscani',
    details: 'Studio · 2 guests · 3 nights',
    totalPrice: '€ 327',
    perNightRate: '€ 109 / night · Member rate',
    status: 'Completed',
  },
  {
    id: 't-dorobanti-mar',
    group: 'past',
    neighborhood: 'Dorobanți',
    neighborhoodColor: '#1565C0',
    dateRange: 'Mar 10 — Mar 14, 2026',
    propertyName: 'Dorobanti 74',
    details: '1 bedroom · 1 guest · 4 nights',
    totalPrice: '€ 512',
    perNightRate: '€ 128 / night · Member rate',
    status: 'Completed',
  },
];

export function upcomingTrips() {
  return mockTrips.filter((t) => t.group === 'upcoming');
}

export function pastTrips() {
  return mockTrips.filter((t) => t.group === 'past');
}
