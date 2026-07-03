'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearBooking } from '@/lib/booking';

/**
 * While a booking is still `pending` (webhook in flight), re-fetch the server
 * component every few seconds so the page flips to confirmed/cancelled without
 * a manual reload. Stops by itself after ~1 minute.
 */
export function ConfirmationPoller() {
  const router = useRouter();
  const ticks = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      ticks.current += 1;
      if (ticks.current > 20) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [router]);

  return null;
}

/**
 * One-shot client effect when a booking lands confirmed: clear the localStorage
 * draft so /checkout stops offering a stale booking. The trip itself now shows
 * up on /my-trips straight from the DB — no client-side has-trips flag needed.
 */
export function BookingConfirmedEffects() {
  useEffect(() => {
    clearBooking();
  }, []);

  return null;
}
