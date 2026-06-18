import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Editorial } from '@/components/sections/Editorial';
import { LocationsCarousel } from '@/components/sections/LocationsCarousel';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Benefits } from '@/components/sections/Benefits';
import { SearchProvider } from '@/components/search/SearchContext';
import { StickySearch } from '@/components/search/StickySearch';

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

export default function HomePage() {
  return (
    <SearchProvider>
      <Hero />
      <StickySearch />
      <Editorial />
      <LocationsCarousel />
      <HowItWorks />
      <Benefits />
    </SearchProvider>
  );
}
