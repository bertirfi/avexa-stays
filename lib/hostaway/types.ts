// Hostaway API shapes — transcribed from the real /v1/listings response
// validated 2026-06-16 (8 listings, prices in RON). Fields are optional
// where Hostaway may omit them; the adapter (Wave 1b) narrows to our needs.

export interface HostawayListing {
  id: number;
  propertyTypeId?: number | null;
  name: string;
  externalListingName?: string | null;
  internalListingName?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  houseRules?: string | null;
  keyPickup?: string | null;
  specialInstruction?: string | null;
  doorSecurityCode?: string | null;
  country?: string | null;
  countryCode?: string | null;
  state?: string | null;
  city?: string | null;
  street?: string | null;
  address?: string | null;
  publicAddress?: string | null;
  zipcode?: string | null;
  /** Base nightly price, in the listing's own currency (RON for AVEXA). */
  price?: number | null;
  currencyCode?: string | null;
  starRating?: number | null;
  weeklyDiscount?: number | null;
  monthlyDiscount?: number | null;
  propertyRentTax?: number | null;
  guestPerPersonPerNightTax?: number | null;
  guestStayTax?: number | null;
  guestNightlyTax?: number | null;
  refundableDamageDeposit?: number | null;
  isDepositStayCollected?: number | null;
  personCapacity?: number | null;
  maxChildrenAllowed?: number | null;
  maxInfantsAllowed?: number | null;
  maxPetsAllowed?: number | null;
  lat?: number | null;
  lng?: number | null;
  checkInTimeStart?: number | null;
  checkInTimeEnd?: number | null;
  checkOutTime?: number | null;
  cancellationPolicy?: string | null;
  squareMeters?: number | null;
  roomType?: string | null;
  bathroomType?: string | null;
  bedroomsNumber?: number | null;
  bedsNumber?: number | null;
  bathroomsNumber?: number | null;
}

/**
 * Calendar day shape — field names confirmed against the diagnostic route's
 * `calendarSample` before the sync (Wave 1b) relies on them. Kept tolerant.
 */
export interface HostawayCalendarDay {
  date: string; // YYYY-MM-DD
  isAvailable?: number; // 1 / 0
  status?: string; // 'available' | 'booked' | ...
  price?: number | null;
  minimumStay?: number | null;
}

export interface HostawayResponse<T> {
  status: string;
  result: T;
  count?: number;
  limit?: number;
  offset?: number;
}

/**
 * One line of the reservation's price-breakdown table in the Hostaway
 * dashboard ("Base rate", "City / Tourism tax", …). Line totals must sum to
 * the reservation's totalPrice; isOverriddenByUser=1 tells Hostaway to keep
 * our values instead of recalculating them from listing fee settings.
 */
export interface HostawayFinanceField {
  type: 'price' | 'tax' | 'fee' | 'discount';
  name: string;
  title: string;
  value: number;
  total: number;
  isIncludedInTotalPrice: 0 | 1;
  isOverriddenByUser: 0 | 1;
}

/**
 * Reservation-creation payload — fields confirmed against the official docs
 * (create endpoint + reservation object). Booleans are 0/1 integers per
 * Hostaway convention; dates are plain YYYY-MM-DD.
 */
export interface HostawayCreateReservationInput {
  listingMapId: number;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  guestName: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestEmail: string;
  phone?: string;
  adults: number;
  children?: number;
  infants?: number;
  numberOfGuests: number;
  /** Full amount the guest paid, in `currency` (RON for AVEXA). */
  totalPrice: number;
  currency: 'RON';
  /** Price breakdown shown in the dashboard (accommodation / extras / city tax). */
  financeField?: HostawayFinanceField[];
  /** Free-text details (invoice data, extras) — client invoices from Hostaway. */
  comment?: string;
}

/** Created reservation (subset of Hostaway's reservation object we rely on). */
export interface HostawayReservation {
  id: number;
  listingMapId?: number;
  channelId?: number;
  arrivalDate?: string;
  departureDate?: string;
  guestName?: string | null;
  guestEmail?: string | null;
  totalPrice?: number | null;
  currency?: string | null;
  status?: string | null;
  confirmationCode?: string | null;
  /** ChargeAutomation writes its pre-arrival check-in link into these notes. */
  guestNote?: string | null;
  hostNote?: string | null;
}

/** Guest conversation attached to a reservation (Hostaway inbox thread). */
export interface HostawayConversation {
  id: number;
  type?: string | null;
  recipientEmail?: string | null;
}

export interface HostawayTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}
