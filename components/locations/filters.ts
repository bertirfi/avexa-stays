import type { LocationsProperty } from '@/types';

// ── Amenity filters ────────────────────────────────────────────
// Catalog labels are inconsistent ("Kitchen" vs "Kitchenette", "Washer" vs
// "Washer & Dryer"), so each filter matches a synonym regex against the union
// of a property's amenity strings. `quick` marks the pills shown in the row;
// every filter shows in the modal. New listings work with zero code change —
// matching is derived, never a hardcoded id list.
export interface AmenityFilter {
  id: string;
  label: string;
  match: RegExp;
  quick?: boolean;
}

export const AMENITY_FILTERS: AmenityFilter[] = [
  { id: 'kitchen', label: 'Kitchen', match: /kitchen/i, quick: true },
  { id: 'ac', label: 'Air conditioning', match: /air conditioning|a\/c/i, quick: true },
  { id: 'washer', label: 'Washer', match: /washer/i, quick: true },
  { id: 'tv', label: 'TV', match: /\btv\b|hdtv/i, quick: true },
  { id: 'dishwasher', label: 'Dishwasher', match: /dishwasher/i, quick: true },
  { id: 'balcony', label: 'Balcony', match: /balcon/i, quick: true },
  { id: 'self-checkin', label: 'Self check-in', match: /self check-?in/i, quick: true },
  { id: 'wifi', label: 'Free Wi-Fi', match: /wi-?fi/i, quick: true },
  { id: 'elevator', label: 'Elevator', match: /elevator|lift/i },
  { id: 'workspace', label: 'Dedicated workspace', match: /workspace/i },
  { id: 'private-entrance', label: 'Private entrance', match: /private entrance/i },
  { id: 'parking', label: 'Parking', match: /parking/i },
  { id: 'pets', label: 'Pets allowed', match: /pets? allowed|pet friendly/i },
  { id: 'bathtub', label: 'Bathtub', match: /bathtub|bath tub/i },
];

export const QUICK_FILTERS = AMENITY_FILTERS.filter((f) => f.quick);

// ── Bedrooms ───────────────────────────────────────────────────
export interface BedroomOption {
  label: string;
  value: number;
}

export const BEDROOM_OPTIONS: BedroomOption[] = [
  { label: 'Any', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
];

// ── Matching ───────────────────────────────────────────────────
// The searchable amenity text = amenitiesTop + flattened property/room
// amenities, EXCLUDING any "Not Included" section — those list what the stay
// lacks (e.g. "Washer" under Not Included means there is no washer), so
// matching them would wrongly flag the property as having the amenity.
function amenityText(property: LocationsProperty): string {
  const flatten = (groups: Record<string, string[]>) =>
    Object.entries(groups)
      .filter(([section]) => !/not included/i.test(section))
      .flatMap(([, items]) => items);

  return [
    ...property.amenitiesTop,
    ...flatten(property.amenitiesProperty),
    ...flatten(property.amenitiesRoom),
  ].join('\n');
}

// Bedrooms derived from the stat label ("1 Bedroom" / "2 Bedrooms"); a Studio
// has no separate bedroom → 0.
export function propertyBedrooms(property: LocationsProperty): number {
  const label = property.stats.find((s) => s.icon === 'bed')?.label ?? '';
  const match = label.match(/(\d+)\s*bedroom/i);
  return match ? Number(match[1]) : 0;
}

export function matchesFilters(
  property: LocationsProperty,
  activeAmenities: Set<string>,
  minBedrooms: number,
): boolean {
  if (propertyBedrooms(property) < minBedrooms) return false;
  if (activeAmenities.size === 0) return true;

  const text = amenityText(property);
  // AND semantics: the property must match every selected amenity.
  return AMENITY_FILTERS.every(
    (f) => !activeAmenities.has(f.id) || f.match.test(text),
  );
}
