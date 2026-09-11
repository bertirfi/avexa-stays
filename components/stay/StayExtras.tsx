'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { Sentences } from '@/components/shared/Sentences';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import { EXTRAS_COPY, extraPriceRon, roomsForCleaning, type ExtraService } from '@/lib/extras';
import { toggleExtra, useBookableExtras, useSelectedExtras } from '@/lib/extras-selection';
import type { Property } from '@/types';
import { cn } from '@/lib/cn';

/**
 * "Elevate your stay" — the pre-booking extras shop. Selection is shared with
 * the booking sidebar through lib/extras-selection, so adding a service here
 * moves the sidebar total and travels to checkout in the `extras` URL param.
 */
export function StayExtras({ property }: { property: Property }) {
  const { format } = useCurrency();
  const selected = useSelectedExtras();
  // Only what can still be prepared in time for the picked check-in.
  const extras = useBookableExtras();
  const rooms = roomsForCleaning(property.cleaningRon);

  return (
    <section className="my-10 overflow-hidden rounded-card bg-ink px-6 py-10 text-cream md:px-10 md:py-12">
      <p className="font-mono-label text-gold">— Extra services</p>
      <h2 className="font-display mt-3 text-3xl md:text-4xl">Elevate your stay.</h2>
      <p className="mt-3 max-w-[46ch] text-sm text-cream/70">
        <Sentences text="Prepared before you arrive. Added to this booking in one tap." />
      </p>

      {/* Mobile: a snap carousel — ten stacked cards would add ~4000px to the
          stay page. sm+: a plain two-column grid. */}
      <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
        {extras.map((extra) => (
          <ExtraCard
            key={extra.id}
            extra={extra}
            price={format(extraPriceRon(extra, rooms))}
            selected={selected.includes(extra.id)}
            onToggle={() => toggleExtra(extra.id)}
          />
        ))}
      </div>

      {extras.length === 0 && (
        <p className="mt-8 text-sm text-cream/70">
          <Sentences text="Your arrival is too close for us to prepare these in time. Write to us and we will do what we can." />
        </p>
      )}

      <ul className="mt-8 space-y-2 border-t border-cream/10 pt-6 text-xs text-cream/70">
        {[EXTRAS_COPY.confirm, EXTRAS_COPY.cancel, EXTRAS_COPY.delivery].map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <Icon name="check" size={14} className="mt-0.5 shrink-0 text-gold" />
            <span>
              <Sentences text={line} />
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-cream/50">Everything can also be added later from My Trips.</p>
        <Link
          href="/extra-services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold transition hover:text-gold-pale"
        >
          All extras &amp; tariffs
          <Icon name="chevRight" size={14} />
        </Link>
      </div>
    </section>
  );
}

function ExtraCard({
  extra,
  price,
  selected,
  onToggle,
}: {
  extra: ExtraService;
  price: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        'flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-card border bg-cream/[0.04] transition duration-300 hover:-translate-y-1 hover:bg-cream/[0.07] sm:w-auto sm:shrink',
        selected ? 'border-gold bg-gold/10' : 'border-cream/10',
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {extra.image ? (
          <Image
            src={extra.image}
            alt={extra.name}
            fill
            sizes="(min-width: 640px) 340px, 100vw"
            className="object-cover"
          />
        ) : (
          <ExtraPlaceholder name={extra.name} />
        )}
        {selected && (
          <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-gold text-ink">
            <Icon name="check" size={14} strokeWidth={2.4} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-tight">{extra.name}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-cream/65">
          <Sentences text={extra.includes} />
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="font-display text-base text-gold">{price}</span>
          <span className="font-mono-label rounded-full border border-cream/15 px-2 py-1 text-cream/60">
            {extra.leadLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={cn(
            'mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition',
            selected
              ? 'bg-gold text-ink hover:bg-gold-pale'
              : 'border border-cream/25 text-cream hover:border-gold hover:text-gold',
          )}
        >
          {selected ? 'Added to booking' : 'Add to booking'}
        </button>
      </div>
    </article>
  );
}

/** Photo slot until the client delivers images (extra.image stays null). */
function ExtraPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_0%,rgba(221,185,122,0.18),transparent_70%)]">
      <span className="font-display grid size-11 place-items-center rounded-[26%] border border-gold/50 text-base text-gold">
        A
      </span>
      <span className="font-mono-label px-4 text-center text-cream/45">{name}</span>
    </div>
  );
}
