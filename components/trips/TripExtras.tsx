'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { startExtrasCheckout } from '@/app/(member)/my-trips/actions';
import { Sentences } from '@/components/shared/Sentences';
import { EXTRAS_COPY } from '@/lib/extras';

/** One still-buyable service, priced for this booking's apartment size. */
export interface AddableExtra {
  id: string;
  name: string;
  includes: string;
  /** "24h ahead" / "72h ahead" / "The evening before". */
  leadLabel: string;
  ron: number;
  /** Public image path, or null until the client delivers photos. */
  image: string | null;
}

const ERROR_COPY: Record<string, string> = {
  already_added: 'Already on this stay.',
  lead_time_passed: 'Too close to check-in for this one.',
  not_bookable: 'Extras can only be added to a confirmed, upcoming stay.',
};

const FALLBACK_ERROR = 'Something went wrong — message us on WhatsApp.';

/**
 * Post-booking add-ons on a My Trips card. Selection is local; the price and
 * the lead time are re-checked server-side by `startExtrasCheckout`, which
 * returns a Stripe Checkout URL (success → /my-trips?extras=added).
 */
export function TripExtras({
  bookingId,
  extras,
}: {
  bookingId: string;
  extras: AddableExtra[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = extras
    .filter((e) => selected.includes(e.id))
    .reduce((sum, e) => sum + e.ron, 0);

  function toggle(id: string) {
    setError(null);
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  return (
    <div className="mt-5 rounded-card border border-gray-line bg-cream p-5">
      <h4 className="font-display text-xl md:text-2xl">Add to your stay</h4>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {extras.map((e) => {
          const on = selected.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(e.id)}
              className={`flex gap-3 rounded-card border bg-white p-3 text-left transition ${
                on
                  ? 'border-gold-dark shadow-[var(--shadow-card-hover)]'
                  : 'border-gray-line hover:border-gold'
              }`}
            >
              {/* Editorial tile — the photo slot until the client delivers images. */}
              <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-ink">
                {e.image ? (
                  <Image src={e.image} alt="" fill className="object-cover" sizes="56px" />
                ) : (
                  <span className="font-display text-xl text-gold">{e.name.charAt(0)}</span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="font-semibold text-ink">{e.name}</span>
                  <span className="text-sm font-semibold text-gold-dark">
                    {e.ron.toLocaleString('en-US')} RON
                  </span>
                </span>
                <span className="mt-1 block text-xs text-ink-60">{e.includes}</span>
                <span className="mt-2 inline-block rounded-full bg-gold-pale px-2 py-0.5 text-[11px] font-semibold text-gold-dark">
                  {e.leadLabel}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-line pt-4">
        <button
          type="button"
          disabled={pending || selected.length === 0}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await startExtrasCheckout(bookingId, selected);
              if (result.ok) window.location.assign(result.url);
              else setError(ERROR_COPY[result.error] ?? FALLBACK_ERROR);
            });
          }}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink/90 disabled:opacity-40"
        >
          {pending ? 'Opening checkout…' : `Pay ${total.toLocaleString('en-US')} RON`}
        </button>
        {error && (
          <p className="text-sm text-[#B23A3A]">
            <Sentences text={error} />
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-1.5 text-xs text-ink-60">
        <p>
          <Sentences text={EXTRAS_COPY.confirm} />
        </p>
        <p>
          <Sentences text={EXTRAS_COPY.cancel} />
        </p>
        <p>
          <Sentences text={EXTRAS_COPY.delivery} />
        </p>
        <p className="text-ink-60/70">
          <Sentences text={`${EXTRAS_COPY.avx} Coming soon.`} />
        </p>
      </div>
    </div>
  );
}
