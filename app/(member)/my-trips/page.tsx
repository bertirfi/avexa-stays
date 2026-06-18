import type { Metadata } from 'next';
import { MyTripsApp } from '@/components/trips/MyTripsApp';

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'Your upcoming and past AVEXA stays.',
  robots: { index: false, follow: false },
};

export default function MyTripsPage() {
  return <MyTripsApp />;
}
