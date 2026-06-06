'use client';

import { useEffect, useState } from 'react';
import { hasTrips, readUser, type StoredUser } from '@/lib/booking';
import { LoggedOutHero } from '@/components/trips/LoggedOutHero';
import { EmptyTripsState } from '@/components/trips/EmptyTripsState';
import { TripsList } from '@/components/trips/TripsList';

export function MyTripsApp() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [trips, setTrips] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(readUser());
    setTrips(hasTrips());

    // Re-read on storage events so D-key toggle in another component
    // (or any other tab) keeps this view in sync without reload.
    function onStorage() {
      setUser(readUser());
      setTrips(hasTrips());
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('avexa:auth-changed', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('avexa:auth-changed', onStorage);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="bg-cream pt-40">
        <div className="mx-auto h-12 max-w-xl animate-pulse rounded-full bg-gray-light" />
      </div>
    );
  }

  if (!user?.loggedIn) return <LoggedOutHero />;
  if (!trips) return <EmptyTripsState name={user.firstName || user.name || 'there'} />;
  return <TripsList name={user.firstName || user.name || 'There'} />;
}
