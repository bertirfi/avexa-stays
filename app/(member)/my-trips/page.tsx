import type { Metadata } from 'next';
import { MyTripsApp } from '@/components/trips/MyTripsApp';
import { requireUser } from '@/lib/auth/server';

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'Your upcoming and past AVEXA stays.',
  robots: { index: false, follow: false },
};

export default async function MyTripsPage() {
  await requireUser('/my-trips');
  return <MyTripsApp />;
}
