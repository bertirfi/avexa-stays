'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { hasTrips, readUser, type StoredUser } from '@/lib/booking';
import { LoggedOutHero } from '@/components/trips/LoggedOutHero';
import { EmptyTripsState } from '@/components/trips/EmptyTripsState';
import { TripsList } from '@/components/trips/TripsList';
import { MosaicSection } from '@/components/trips/MosaicSection';
import { ContactSection } from '@/components/trips/ContactSection';

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

  let main: ReactNode;
  if (!user?.loggedIn) {
    main = <LoggedOutHero />;
  } else if (!trips) {
    main = <EmptyTripsState name={user.firstName || user.name || 'there'} />;
  } else {
    main = <TripsList name={user.firstName || user.name || 'There'} />;
  }

  // Mosaic + Contact are shared page chrome — rendered below the main content
  // in every state (logged-out hero, empty, and with trips), matching the source.
  return (
    <>
      {main}
      <MosaicSection />
      <ContactSection />
    </>
  );
}
