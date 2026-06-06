import { Hero } from '@/components/sections/Hero';
import { Editorial } from '@/components/sections/Editorial';
import { LocationsCarousel } from '@/components/sections/LocationsCarousel';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Benefits } from '@/components/sections/Benefits';
import { SearchProvider } from '@/components/search/SearchContext';
import { StickySearch } from '@/components/search/StickySearch';

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
