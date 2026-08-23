import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LocationsView } from '@/components/locations/LocationsView';
import { SearchParamsSync } from '@/components/search/SearchParamsSync';
import { getAllPropertiesData } from '@/lib/data/properties';
import { JsonLd } from '@/components/seo/JsonLd';
import { getFxRateEur } from '@/lib/pricing';
import type { LocationsProperty, Property } from '@/types';

const SITE_URL = 'https://avexastays.com';

export const metadata: Metadata = {
  // Primary keyword leads (SEO hard rule: home + locations carry it).
  title: 'Bucharest City Center Apartments — Locations',
  description:
    'Direct rates and fully digital check-in at every AVEXA apartment in Bucharest City Center — Old Town, Calea Victoriei, Universitate & Piața Romană.',
  alternates: { canonical: '/locations' },
};

// ISR — refresh live prices from Supabase every 15 minutes.
export const revalidate = 900;

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

/**
 * Slim card DTO — the client view only renders name/photos/price/filters, so
 * the heavy editorial content (description, FAQs, reviews, nearby, photos
 * beyond the card's 5-slide carousel) never reaches the ISR HTML or the
 * hydration payload (~5KB saved per suite). The full `properties` array stays
 * server-side for the JSON-LD schema above.
 */
function toLocationsProperty(p: Property): LocationsProperty {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    neighborhood: p.neighborhood,
    neighborhoodLabel: p.neighborhoodLabel,
    neighborhoodColor: p.neighborhoodColor,
    building: p.building,
    coordinates: p.coordinates,
    stats: p.stats,
    maxGuests: p.maxGuests,
    cover: p.cover,
    photos: p.photos.slice(0, 5),
    rates: p.rates.map((r) => ({ perNight: r.perNight })),
    amenitiesTop: p.amenitiesTop,
    amenitiesProperty: p.amenitiesProperty,
    amenitiesRoom: p.amenitiesRoom,
  };
}

/**
 * ItemList of all suites — lets Google + LLMs read the listing as structured
 * data. rates[].perNight is RON (money of record); JSON-LD keeps the site's
 * default display currency (EUR), so prices are converted here server-side.
 */
function buildItemListSchema(properties: Property[], fxRateEur: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AVEXA Stays — Bucharest City Center Apartments',
    numberOfItems: properties.length,
    itemListElement: properties.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': ['Apartment', 'LodgingBusiness'],
        name: p.name,
        url: `${SITE_URL}/locations/${p.slug}`,
        image: absoluteUrl(p.cover),
        address: {
          '@type': 'PostalAddress',
          streetAddress: p.address,
          addressLocality: 'Bucharest',
          addressRegion: p.neighborhoodLabel,
          addressCountry: 'RO',
        },
        offers: {
          '@type': 'Offer',
          price: Math.round(p.rates[0].perNight / fxRateEur),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/locations/${p.slug}`,
        },
      },
    })),
  };
}

function buildBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Locations', item: `${SITE_URL}/locations` },
    ],
  };
}

export default async function LocationsPage() {
  const properties = await getAllPropertiesData();
  const fxRateEur = getFxRateEur();
  return (
    <div className="pt-0 sm:pt-20 md:pt-[152px]">
      <JsonLd data={buildItemListSchema(properties, fxRateEur)} />
      <JsonLd data={buildBreadcrumbSchema()} />
      {/* useSearchParams lives in its own Suspense island so the SEO-critical
          listing below stays in the static (ISR) HTML. */}
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      <LocationsView properties={properties.map(toLocationsProperty)} />
    </div>
  );
}
