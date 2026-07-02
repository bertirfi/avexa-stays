import type { Metadata } from 'next';
import { LocationsView } from '@/components/locations/LocationsView';
import { getAllPropertiesData } from '@/lib/data/properties';
import { JsonLd } from '@/components/seo/JsonLd';
import { getFxRateEur } from '@/lib/pricing';
import type { Property } from '@/types';

const SITE_URL = 'https://avexastays.com';

export const metadata: Metadata = {
  title: 'Locations in Bucharest',
  description:
    'Member rates and fully digital check-in at every AVEXA address across Bucharest City Center — Calea Victoriei, Old City Center, Universitate, and Piața Romană.',
  alternates: { canonical: '/locations' },
};

// ISR — refresh live prices from Supabase every 15 minutes.
export const revalidate = 900;

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
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
    <div className="pt-0 sm:pt-20">
      <JsonLd data={buildItemListSchema(properties, fxRateEur)} />
      <JsonLd data={buildBreadcrumbSchema()} />
      <LocationsView properties={properties} />
    </div>
  );
}
