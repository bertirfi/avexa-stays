'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { GuestCounts } from '@/types';
import { readSearchPrefs, writeSearchPrefs, datesToPrefs } from '@/lib/searchPrefs';
import { parseYmd } from '@/lib/date';

export type SearchPanel = 'location' | 'dates' | 'guests';

interface SearchContextValue {
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  guests: GuestCounts;
  setLocation: (id: string) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  setGuests: (g: GuestCounts) => void;
  /** Which panel is open + which pill opened it (so only that pill renders it). */
  activePanel: SearchPanel | null;
  activePillId: string | null;
  openPanel: (panel: SearchPanel, pillId: string) => void;
  closePanel: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Shared search state for the homepage's two pills (hero + sticky). Selecting a
 * value in either pill updates both, because they read the same context.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0 });
  const [activePanel, setActivePanel] = useState<SearchPanel | null>(null);
  const [activePillId, setActivePillId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate once from localStorage (client-only → no SSR mismatch). This is how
  // the selection survives homepage → /locations and feeds the property sidebar.
  useEffect(() => {
    const p = readSearchPrefs();
    if (p) {
      setLocation(p.location ?? '');
      setStartDate(parseYmd(p.checkIn));
      setEndDate(parseYmd(p.checkOut));
      if (p.guests) setGuests(p.guests);
    }
    setReady(true);
  }, []);

  // Persist after hydration so we never clobber saved prefs with the initial state.
  useEffect(() => {
    if (!ready) return;
    writeSearchPrefs({ location, ...datesToPrefs(startDate, endDate), guests });
  }, [ready, location, startDate, endDate, guests]);

  const value = useMemo<SearchContextValue>(
    () => ({
      location,
      startDate,
      endDate,
      guests,
      setLocation,
      setDates: (s, e) => {
        setStartDate(s);
        setEndDate(e);
      },
      setGuests,
      activePanel,
      activePillId,
      openPanel: (panel, pillId) => {
        setActivePanel(panel);
        setActivePillId(pillId);
      },
      closePanel: () => {
        setActivePanel(null);
        setActivePillId(null);
      },
    }),
    [location, startDate, endDate, guests, activePanel, activePillId],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a <SearchProvider>');
  return ctx;
}
