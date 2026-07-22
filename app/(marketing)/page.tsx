import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Editorial } from '@/components/sections/Editorial';
import { LocationsCarousel } from '@/components/sections/LocationsCarousel';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Benefits } from '@/components/sections/Benefits';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://avexastays.com';

export const metadata: Metadata = {
  // Absolute = bypass the "%s · AVEXA Stays" template; keyword leads.
  title: { absolute: 'Bucharest City Center Apartments | AVEXA Stays' },
  description:
    'Book premium apartments in Bucharest city center — direct rates, digital check-in, no front desk. Old Town, Calea Victoriei, Universitate & Piața Romană.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Bucharest City Center Apartments — AVEXA Stays',
    description:
      'Premium apartments in the heart of Bucharest. Booked direct, kept honest. No front desk, no friction.',
    url: 'https://avexastays.com',
    siteName: 'AVEXA Stays',
    type: 'website',
    locale: 'en_US',
  },
};

// Brand entity for Google/LLMs. logo points to the OG PNG until a dedicated
// square logo lands in /public/logos. No SearchAction — there is no text-search
// endpoint yet, and declaring a fake one is invalid structured data.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'AVEXA Stays',
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  image: `${SITE_URL}/opengraph-image`,
  description:
    'Premium short and medium-stay apartments in the heart of Bucharest. Booked direct, kept honest.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bucharest',
    addressCountry: 'RO',
  },
  sameAs: [
    'https://instagram.com/avexastays',
    'https://tiktok.com/@avexastays',
    'https://facebook.com/avexastays',
    'https://linkedin.com/company/avexa',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'AVEXA Stays',
  url: SITE_URL,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <Hero />
      <Editorial />
      <LocationsCarousel />
      <HowItWorks />
      <Benefits />
    </>
  );
}
