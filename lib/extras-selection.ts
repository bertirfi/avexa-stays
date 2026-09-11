'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { EXTRAS, extrasStillBookable, getExtra, type ExtraService } from '@/lib/extras';

/**
 * The pre-booking extras selection, shared between the "Elevate your stay"
 * section and the booking sidebar — two client trees under the same server
 * page, so a module store is the smallest thing that syncs them (a context
 * would have to be threaded through the server component in between).
 *
 * ponytail: module-level state, not per-property. Extra ids are the same for
 * every apartment (only the price differs), so carrying a selection across a
 * property switch is harmless.
 */

const EMPTY: readonly string[] = [];

let selected: readonly string[] = EMPTY;
/** Selected check-in, 'YYYY-MM-DD', or null while no dates are picked. */
let checkIn: string | null = null;
const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn();
}

/** Catalogue still orderable for the current check-in (all of it when none). */
function bookableNow(): ExtraService[] {
  return checkIn ? extrasStillBookable(checkIn) : EXTRAS;
}

export function toggleExtra(id: string) {
  if (!getExtra(id)) return; // never let an unknown id reach the quote
  // Lead time has passed for this check-in — quoteBooking would drop it anyway.
  if (!bookableNow().some((e) => e.id === id)) return;
  selected = selected.includes(id)
    ? selected.filter((x) => x !== id)
    : [...selected, id];
  emit();
}

/**
 * Set the check-in the extras are being bought for. Anything whose lead time
 * has already passed is dropped from the selection, so the client total equals
 * what quoteBooking charges server-side.
 */
export function setExtrasCheckIn(next: string | null) {
  if (next === checkIn) return;
  checkIn = next;
  const allowed = new Set<string>(bookableNow().map((e) => e.id));
  const kept = selected.filter((id) => allowed.has(id));
  if (kept.length !== selected.length) selected = kept.length ? kept : EMPTY;
  emit();
}

/** Selected catalogue ids, in the order the guest picked them. */
export function useSelectedExtras(): readonly string[] {
  return useSyncExternalStore(subscribe, () => selected, () => EMPTY);
}

/** Extras offerable for the selected check-in — the only ones to render. */
export function useBookableExtras(): ExtraService[] {
  // Server render has no check-in yet, same as the client's first paint.
  const ci = useSyncExternalStore(subscribe, () => checkIn, () => null);
  return useMemo(() => (ci ? extrasStillBookable(ci) : EXTRAS), [ci]);
}
