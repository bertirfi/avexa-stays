import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Editorial } from '@/components/sections/Editorial';
import { LocationsCarousel } from '@/components/sections/LocationsCarousel';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Benefits } from '@/components/sections/Benefits';
import { StickyBookNow } from '@/components/sections/StickyBookNow';

const SITE_URL = 'https://avexastays.com';

export const metadata: Metadata = {
  // Absolute = bypass the "%s · AVEXA Stays" template; keyword leads.
  title: { absolute: 'Bucharest City Center Apartments | AVEXA Stays' },
  description:
    'AVEXA Stays: premium Bucharest stays in city-center apartments — direct rates, digital check-in, no front desk. Old Town, Calea Victoriei & Piața Romană.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Bucharest City Center Apartments — AVEXA Stays',
    description:
      'Premium apartments in the heart of Bucharest. Booked direct, kept honest. No front desk, no friction.',
    url: 'https://avexastays.com',
    siteName: 'AVEXA',
    type: 'website',
    locale: 'en_US',
    // Defining `openGraph` here suppresses the app/opengraph-image.tsx
    // file convention, so the image must be re-declared explicitly.
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Editorial />
      <LocationsCarousel />
      <HowItWorks />
      <Benefits />
      <StickyBookNow />
    </>
  );
}
