'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { getLocationCard } from '@/lib/locationCards';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import type { Property } from '@/types';
import { cn } from '@/lib/cn';

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeToMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** True on <md viewports (client); false during SSR. */
function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

interface PropertyCardProps {
  property: Property;
  index?: number;
  active?: boolean;
  onActivate?: () => void;
  onClear?: () => void;
}

export function PropertyCard({
  property,
  index = 0,
  active = false,
  onActivate,
  onClear,
}: PropertyCardProps) {
  const card = getLocationCard(property.id);
  const photos = property.photos.slice(0, 5);
  const [slide, setSlide] = useState(0);
  const [fav, setFav] = useState(false);
  const { format } = useCurrency();

  const bedType = property.stats.find((s) => s.icon === 'bed')?.label ?? '';
  const saver = property.rates[0];
  // Mobile: no entry animation — the fade+rise reads as a flicker while
  // images stream in on slower devices. Desktop keeps the staggered reveal.
  const isMobile = useIsMobile();

  function go(delta: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSlide((i) => (i + delta + photos.length) % photos.length);
  }

  return (
    <motion.article
      id={`loc-card-${property.id}`}
      onMouseEnter={onActivate}
      onMouseLeave={onClear}
      initial={isMobile ? false : { opacity: 0, y: 24 }}
      whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group scroll-mt-44 overflow-hidden rounded-[18px] border-[1.5px] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_18px_40px_-20px_rgba(25,25,25,0.22)]',
        active
          ? 'border-gold shadow-[0_18px_40px_-20px_rgba(25,25,25,0.22)]'
          : 'border-transparent shadow-[0_1px_2px_rgba(25,25,25,0.04)]',
      )}
    >
      {/* Media carousel */}
      <div className="relative aspect-[2.4/1] overflow-hidden rounded-[14px] bg-gray-light">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              i === slide ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Image
              src={p.src}
              alt={`${property.name} — ${p.label}`}
              fill
              sizes="(min-width: 1024px) 840px, 100vw"
              className="object-cover"
            />
          </div>
        ))}

        {/* Top-left tag */}
        {bedType && (
          <span className="font-mono-label absolute left-3.5 top-3.5 rounded-full bg-ink/70 px-2.5 py-1.5 text-[10px] text-white backdrop-blur">
            {bedType}
          </span>
        )}

        {/* Fav */}
        <button
          type="button"
          aria-label="Save"
          onClick={(e) => {
            e.preventDefault();
            setFav((f) => !f);
          }}
          className="absolute right-3.5 top-3.5 grid size-8 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-white"
        >
          <Icon name="heart" size={15} className={fav ? 'fill-gold text-gold' : ''} />
        </button>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => go(-1, e)}
          className="absolute left-3.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 transition hover:scale-105 group-hover:opacity-100"
        >
          <Icon name="chevLeft" size={14} />
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => go(1, e)}
          className="absolute right-3.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 opacity-0 transition hover:scale-105 group-hover:opacity-100"
        >
          <Icon name="chevRight" size={14} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full bg-white/50 transition-all',
                i === slide ? 'w-5 bg-white' : 'w-1.5',
              )}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 items-start gap-4 p-6 sm:grid-cols-[1fr_auto]">
        <div>
          <span
            className="block text-[12px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: property.neighborhoodColor }}
          >
            {property.neighborhoodLabel}
          </span>
          <h3 className="font-display mt-2 text-2xl leading-tight">{property.name}</h3>
          <p className="mt-1.5 max-w-[460px] text-[15px] text-ink-60">
            {card?.cardTagline ?? property.tagline}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {(card?.cardAmenities ?? property.amenitiesTop.slice(0, 5)).map((a) => (
              <span
                key={a}
                className="rounded-full border border-gray-line bg-cream px-2.5 py-1 text-[11.5px]"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-flex items-baseline gap-1 rounded-full bg-gold px-3.5 py-2.5 font-bold text-ink">
            <span className="font-display text-[22px]">{format(saver.perNight)}</span>
            <span className="text-[11.5px] font-medium opacity-70">/night</span>
          </span>
          <span className="mt-1.5 block text-[11px] text-ink-60">Member rate · incl. taxes</span>
        </div>

        <div className="sm:col-span-2">
          <Link
            href={`/locations/${property.slug}`}
            className="block w-full rounded-xl bg-ink px-4 py-3.5 text-center text-sm font-semibold text-cream transition hover:bg-gold-dark"
          >
            View details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
