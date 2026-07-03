'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearBooking } from '@/lib/booking';
import { CONTACT_EMAIL, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact';

// ~20 refreshes × 3s ≈ 1 min before we stop pulsing and show a calm fallback.
const MAX_TICKS = 20;

/**
 * While a booking is still `pending` (webhook in flight), re-fetch the server
 * component every few seconds so the page flips to confirmed/cancelled without
 * a manual reload. After ~1 minute it STOPS and renders a reassuring fallback
 * (never an infinite pulse): the payment succeeded; the confirmation is just
 * lagging and will land in My Trips.
 */
export function ConfirmationPoller() {
  const router = useRouter();
  const ticks = useRef(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      ticks.current += 1;
      if (ticks.current > MAX_TICKS) {
        clearInterval(id);
        setGaveUp(true);
        return;
      }
      router.refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [router]);

  if (!gaveUp) {
    return (
      <>
        <p className="font-mono-label text-[10px] uppercase tracking-widest text-gold-dark">
          Finalizing your booking
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
          Payment received — confirming your suite…
        </h1>
        <p className="mt-3 text-ink/70">
          This takes a few seconds. The page updates automatically.
        </p>
        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-gold" />
        </div>
      </>
    );
  }

  return (
    <>
      <p className="font-mono-label text-[10px] uppercase tracking-widest text-gold-dark">
        Payment confirmed
      </p>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">
        Still finalizing your booking
      </h1>
      <p className="mt-3 leading-relaxed text-ink/70">
        Your payment went through — the confirmation is taking longer than usual.
        It will appear in My Trips shortly.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/my-trips"
          className="inline-block rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-ink/85"
        >
          Go to My Trips
        </Link>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full border border-ink/15 px-6 py-3 font-display text-sm font-bold text-ink transition hover:border-ink/40"
        >
          Contact us
        </a>
      </div>
      <p className="mt-4 text-[12px] text-ink/50">
        Prefer email or phone?{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-ink">
          {CONTACT_EMAIL}
        </a>{' '}
        ·{' '}
        <a href={PHONE_TEL} className="underline hover:text-ink">
          call us
        </a>
      </p>
    </>
  );
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
