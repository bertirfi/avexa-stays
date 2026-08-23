'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/components/search/SearchContext';
import { readSearchPrefs, writeSearchPrefs } from '@/lib/searchPrefs';
import { readGuestParams, readRangeParams } from '@/lib/searchParams';
import { parseYmd } from '@/lib/date';

/**
 * Hydrates SearchContext from the URL search params (URL wins over
 * localStorage) so a shared /locations?arrival=... link shows the searched
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

    const { arrival, departure } = readRangeParams(sp);
    const where = sp.get('where');
    const urlGuests = readGuestParams(sp);
    // No search params at all → keep whatever localStorage hydration restores.
    if (!arrival && !departure && !where && !urlGuests) return;

    // buildSearchQuery omits `where` when 'all' — absence means "all".
    const location = where ?? 'all';
    const start = parseYmd(arrival);
    const end = parseYmd(departure);

    setLocation(location);
    setDates(start, end);
    if (urlGuests) setGuests(urlGuests);
    writeSearchPrefs({
      location,
      checkIn: start && arrival ? arrival : null,
      checkOut: end && departure ? departure : null,
      // A dates-only deep link must not clobber remembered guest counts.
      guests: urlGuests ?? readSearchPrefs()?.guests ?? { adults: 1, children: 0, infants: 0 },
    });
  }, [sp, setLocation, setDates, setGuests]);

  return null;
}
