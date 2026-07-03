'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { neighborhoods } from '@/lib/neighborhoods';
import { cn } from '@/lib/cn';

function cardBackground(color: string) {
  return (
    `repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 2px, transparent 2px 16px),` +
    `linear-gradient(160deg, ${color} 0%, #14110d 100%)`
  );
}

export function LocationsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // drag state
  const drag = useRef({ active: false, startX: 0, scrollStart: 0, moved: 0 });

  function updateArrows() {
    const el = carouselRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 10);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 10);
  }

  useEffect(() => {
    updateArrows();
    const el = carouselRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      if (!drag.current.active || !el) return;
      e.preventDefault();
      const dx = e.pageX - drag.current.startX;
      drag.current.moved = Math.abs(dx);
      el.scrollLeft = drag.current.scrollStart - dx;
    }
    function onUp() {
      if (!drag.current.active || !el) return;
      drag.current.active = false;
      el.style.scrollSnapType = 'x mandatory';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    const el = carouselRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX, scrollStart: el.scrollLeft, moved: 0 };
    el.style.scrollSnapType = 'none';
  }

  function scrollByCard(dir: number) {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-loc-card]');
    const w = card ? card.offsetWidth + 20 : 440;
    el.scrollBy({ left: dir * w, behavior: 'smooth' });
  }

  return (
    <section id="locations" className="relative bg-white py-[clamp(90px,11vw,150px)]">
      {/* Header */}
      <div className="mx-auto mb-14 flex max-w-[1360px] flex-wrap items-end justify-between gap-6 px-6 md:px-10">
        <Reveal direction="up">
          <p className="font-mono-label mb-4 text-gold-dark">— WHERE WE ARE</p>
          <h2
            className="font-display max-w-[760px]"
            style={{ fontSize: 'clamp(36px,5.5vw,64px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            Bucharest city center, at the heart of every neighborhood.
          </h2>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <Link
            href="/locations"
            className="font-mono-label pb-3 text-gold-dark transition hover:text-ink"
          >
            View all listings →
          </Link>
        </Reveal>
      </div>

      {/* Carousel */}
      <div className="relative">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollByCard(-1)}
          className={cn(
            'absolute left-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-gray-line bg-white text-ink shadow-[0_4px_16px_rgba(25,25,25,.1)] transition hover:scale-105 hover:bg-ink hover:text-white sm:grid md:left-6',
            atStart && 'pointer-events-none opacity-0',
          )}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          ref={carouselRef}
          onScroll={updateArrows}
          onMouseDown={onMouseDown}
          className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-3.5 overflow-x-auto px-6 pb-2 active:cursor-grabbing sm:gap-5 sm:pb-6 md:px-10"
        >
          {neighborhoods.map((n) => (
            <Link
              key={n.id}
              href={`/locations?where=${n.id}`}
              data-loc-card
              onClick={(e) => {
                if (drag.current.moved > 5) e.preventDefault();
              }}
              draggable={false}
              className={cn(
                'group relative snap-start',
                // Mobile: compact card, text below the photo
                'flex-[0_0_200px]',
                // Desktop (≥sm): full-bleed big card, text overlaid
                'sm:h-[440px] sm:flex-[0_0_min(420px,78vw)] sm:overflow-hidden sm:rounded-[22px] sm:transition-all sm:duration-[400ms] sm:ease-[var(--ease-snap)] sm:hover:-translate-y-2 sm:hover:shadow-[0_28px_56px_-20px_rgba(25,25,25,.35)]',
              )}
            >
              {/* Photo — compact rounded block on mobile, full-bleed on desktop */}
              <div className="relative h-[200px] overflow-hidden rounded-[16px] sm:absolute sm:inset-0 sm:h-auto sm:rounded-none">
                {/* Color gradient stays underneath as the loading backdrop */}
                <div className="absolute inset-0" style={{ background: cardBackground(n.color) }} />
                <Image
                  src={n.coverImage}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(max-width: 640px) 200px, 420px"
                  className="object-cover transition-transform duration-[600ms] ease-[var(--ease-snap)] sm:group-hover:scale-[1.04]"
                  style={{ objectPosition: n.coverPosition ?? 'center' }}
                />
                {/* Neighborhood-color glaze (identity) + legibility gradient */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(160deg, ${n.color}59 0%, transparent 45%)` }}
                />
                <div className="absolute inset-0 hidden bg-gradient-to-t from-ink/75 via-ink/20 to-transparent sm:block" />

                {/* Neighborhood pill (desktop only) */}
                <span className="font-mono-label absolute left-6 top-6 z-[2] hidden items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-[11px] text-ink sm:flex">
                  <span className="pulse-dot size-[7px] rounded-full" style={{ background: n.color }} />
                  {n.area}
                </span>

                {/* Overlaid text (desktop only) */}
                <div className="absolute bottom-7 left-6 right-6 z-[2] hidden text-white sm:block">
                  <div className="font-display text-[32px] leading-[1.1] tracking-[-0.01em]">{n.label}</div>
                  <div className="mt-1.5 max-w-[280px] text-sm text-white/70">{n.description}</div>
                </div>

                {/* Count (desktop only) */}
                <div className="font-display absolute bottom-7 right-7 z-[2] hidden text-[80px] leading-none tracking-[-0.03em] text-white/15 sm:block">
                  {String(n.propertyCount).padStart(2, '0')}
                </div>
              </div>

              {/* Text below the photo (mobile only) */}
              <div className="pt-2.5 sm:hidden">
                <div className="font-display text-[16px] leading-[1.2] text-ink">{n.label}</div>
                <div className="mt-[3px] text-[12px] leading-snug text-ink-60">{n.description}</div>
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollByCard(1)}
          className={cn(
            'absolute right-3 top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-gray-line bg-white text-ink shadow-[0_4px_16px_rgba(25,25,25,.1)] transition hover:scale-105 hover:bg-ink hover:text-white sm:grid md:right-6',
            atEnd && 'pointer-events-none opacity-0',
          )}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="m7.5 5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Drag hint (desktop only — swipe is obvious on mobile) */}
      <div className="font-mono-label mt-6 hidden items-center justify-center gap-3 text-[10px] text-ink-60 sm:flex">
        <span className="h-px w-7 bg-gray-line" />
        Drag to explore
        <span className="h-px w-7 bg-gray-line" />
      </div>
    </section>
  );
}
