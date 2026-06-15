import type { Metadata } from 'next';
import { LocationsView } from '@/components/locations/LocationsView';
import { getAllPropertiesData } from '@/lib/data/properties';

export const metadata: Metadata = {
  title: 'Locations in Bucharest',
  description:
    'Member rates and fully digital check-in at every AVEXA address across Bucharest City Center — Calea Victoriei, Old City Center, Universitate, and Piața Romană.',
};

// ISR — refresh live prices from Supabase every 15 minutes.
export const revalidate = 900;

export default async function LocationsPage() {
  const properties = await getAllPropertiesData();
  return (
    <div className="pt-0 sm:pt-20">
      <LocationsView properties={properties} />
    </div>
  );
}
