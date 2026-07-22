'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/components/search/SearchContext';
import { readSearchPrefs, writeSearchPrefs } from '@/lib/searchPrefs';
import { parseYmd } from '@/lib/date';

/**
 * Hydrates SearchContext from the URL search params (URL wins over
 * localStorage) so a shared /locations?checkIn=... link shows the searched
 * values in the header pill on cold load.
 *
 * Rendered in its OWN <Suspense> boundary next to the page content — putting
 * useSearchParams inside LocationsView would pull the whole (SEO-critical)
 * listing out of the static HTML under ISR.
 *
 * Ordering note: this child effect runs BEFORE SearchProvider's localStorage
 * hydration effect (React mounts child effects first), so writing the URL
 * values to searchPrefs here is what makes the URL win.
 */
export function SearchParamsSync() {
  const sp = useSearchParams();
  const { setLocation, setDates, setGuests } = useSearch();
  const applied = useRef<string | null>(null);

  useEffect(() => {
    const key = sp.toString();
    if (applied.current === key) return;
    applied.current = key;

    const checkIn = sp.get('checkIn');
    const checkOut = sp.get('checkOut');
    const where = sp.get('where');
    const adults = sp.get('adults');
    // No search params at all → keep whatever localStorage hydration restores.
    if (!checkIn && !checkOut && !where && !adults) return;

    // SearchPill.go() omits `where` when 'all' — absence means "all".
    const location = where ?? 'all';
    const start = parseYmd(checkIn);
    const end = parseYmd(checkOut);
    const guests = {
      adults: Math.min(10, Math.max(1, Number(adults) || 1)),
      children: Math.min(10, Math.max(0, Number(sp.get('children')) || 0)),
      infants: Math.min(10, Math.max(0, Number(sp.get('infants')) || 0)),
    };

    setLocation(location);
    setDates(start, end);
    if (adults !== null) setGuests(guests);
    writeSearchPrefs({
      location,
      checkIn: start && checkIn ? checkIn : null,
      checkOut: end && checkOut ? checkOut : null,
      // A dates-only deep link must not clobber remembered guest counts.
      guests: adults !== null ? guests : (readSearchPrefs()?.guests ?? guests),
    });
  }, [sp, setLocation, setDates, setGuests]);

  return null;
}
