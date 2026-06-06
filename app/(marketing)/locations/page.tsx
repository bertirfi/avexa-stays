import type { Metadata } from 'next';
import { LocationsView } from '@/components/locations/LocationsView';

export const metadata: Metadata = {
  title: 'Locations in Bucharest',
  description:
    'Member rates and fully digital check-in at every AVEXA address across Bucharest City Center — Calea Victoriei, Old City Center, Universitate, and Piața Romană.',
};

export default function LocationsPage() {
  return (
    <div className="pt-20">
      <LocationsView />
    </div>
  );
}
