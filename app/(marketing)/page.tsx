import { Hero } from '@/components/sections/Hero';
import { Editorial } from '@/components/sections/Editorial';
import { LocationsCarousel } from '@/components/sections/LocationsCarousel';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Benefits } from '@/components/sections/Benefits';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Editorial />
      <LocationsCarousel />
      <HowItWorks />
      <Benefits />
    </>
  );
}
