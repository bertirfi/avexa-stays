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

export interface HostawayTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}
