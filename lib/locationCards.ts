/**
 * Location-card copy — short marketing taglines + amenity chips per suite,
 * ported verbatim from locations.html (the card data array).
 * Keyed by property id. Joined with lib/properties.ts at render time.
 */

export interface LocationCard {
  cardTagline: string;
  cardAmenities: string[];
}

export const locationCards: Record<string, LocationCard> = {
  '101': {
    cardTagline: 'A botanical retreat in the iconic Adriatica Palace, steps from Old Town.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchenette', 'Netflix', 'Elevator'],
  },
  '201': {
    cardTagline: 'Botanical sanctuary overlooking the Dâmbovița River, gateway to Old Town.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', 'Dishwasher', 'Washer'],
  },
  '202': {
    cardTagline: 'Stirbey Palace views from two private balconies on Calea Victoriei.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', 'Dishwasher', 'Balcony'],
  },
  '203': {
    cardTagline: 'A sophisticated central sanctuary, 2 min from Old Town.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', 'Dishwasher', '2 Bathrooms'],
  },
  '301': {
    cardTagline: 'The city, effortlessly yours.',
    cardAmenities: ['Kitchen', 'Free Wi-Fi', 'A/C', 'Elevator'],
  },
  '302': {
    cardTagline: 'Sapphire-toned sanctuary on Calea Victoriei with Știrbei Palace views.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', '75" TV', 'Washer'],
  },
  '303': {
    cardTagline: 'Prestigious Calea Victoriei address, freshly renovated luxury for families or groups.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', 'Dishwasher', 'Dryer'],
  },
  '304': {
    cardTagline: 'Smart city living with the AVEXA touch of luxury, peace, and seamless technology.',
    cardAmenities: ['Free Wi-Fi', 'A/C', 'Kitchen', 'Washer', 'Smart TV'],
  },
};

export function getLocationCard(id: string): LocationCard | undefined {
  return locationCards[id];
}
