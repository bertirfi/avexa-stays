import { ymd } from '@/lib/date';
import type { GuestCounts } from '@/types';

/** Remembered search selection — bridges homepage → /locations → property page. */
export interface SearchPrefs {
  location: string; // '' | 'all' | neighborhood id
  checkIn: string | null; // 'YYYY-MM-DD'
  checkOut: string | null;
  guests: GuestCounts;
}

const KEY = 'avexa_search';

export function readSearchPrefs(): SearchPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SearchPrefs) : null;
  } catch {
    return null;
  }
}

export function writeSearchPrefs(prefs: SearchPrefs) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}

/** Serialize a date range to 'YYYY-MM-DD' strings (local, no tz shift). */
export function datesToPrefs(start: Date | null, end: Date | null) {
  return {
    checkIn: start ? ymd(start) : null,
    checkOut: end ? ymd(end) : null,
  };
}
