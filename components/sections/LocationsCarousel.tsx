'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { Icon } from '@/components/Icon';
import { Reveal } from '@/components/Reveal';
import { neighborhoods } from '@/lib/neighborhoods';

export function LocationsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function shift(delta: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <section id="locations" className="bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal direction="up">
          <p className="font-mono-label mb-3 text-gold-dark">— WHERE WE ARE</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display max-w-[800px] text-4xl md:text-6xl">
              Bucharest city center, at the heart of every neighborhood.
            </h2>
            <Link href="/locations" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
              View all listings →
            </Link>
          </div>
        </Reveal>

        <div className="relative mt-12">
          {/* Arrows (desktop) */}
          <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => shift(-450)}
              className="grid size-10 place-items-center rounded-full border border-gray-line hover:bg-ink hover:text-cream"
            >
              <Icon name="chevLeft" size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => shift(450)}
              className="grid size-10 place-items-center rounded-full border border-gray-line hover:bg-ink hover:text-cream"
            >
              <Icon name="chevRight" size={18} />
            </button>
          </div>

          <div
            ref={scrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          >
            {neighborhoods.map((n) => (
              <Link
                key={n.id}
                href={`/locations?where=${n.id}`}
                className="group relative h-[420px] w-[320px] flex-none snap-start overflow-hidden rounded-card md:w-[400px]"
              >
                <Image
                  src={n.coverImage}
                  alt={n.label}
                  fill
                  sizes="(min-width: 768px) 400px, 320px"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5">
                  <span
                    aria-hidden
                    className="size-2 rounded-full pulse-dot"
                    style={{ background: n.color }}
                  />
                  <span className="text-xs font-semibold text-ink">{n.area}</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-cream">
                  <h3 className="font-display text-4xl md:text-5xl">{n.label}</h3>
                  <p className="mt-2 text-base text-cream/80">{n.description}</p>
                </div>

                <span className="absolute right-5 top-5 rounded-full bg-white/95 px-3 py-1.5 font-mono-label text-ink">
                  {String(n.propertyCount).padStart(2, '0')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Reveal direction="up">
          <div className="font-mono-label mt-10 flex items-center justify-center gap-4 text-ink-60">
            <span className="h-px w-12 bg-gray-line" />
            <span>Drag to explore</span>
            <span className="h-px w-12 bg-gray-line" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
