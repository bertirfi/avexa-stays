'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { SearchPill } from '@/components/search/SearchPill';
import { SearchProvider } from '@/components/search/SearchContext';
import { PropertyCard } from '@/components/locations/PropertyCard';
import { StylizedMap } from '@/components/locations/StylizedMap';
import { neighborhoods } from '@/lib/neighborhoods';
import { properties, getPropertiesByNeighborhood } from '@/lib/properties';
import { cn } from '@/lib/cn';

export function LocationsView() {
  const [mapOpen, setMapOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const groups = neighborhoods
    .map((n) => ({ neighborhood: n, items: getPropertiesByNeighborhood(n.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="bg-cream">
      {/* Sticky search bar */}
      <div className="sticky top-20 z-[54] px-6 pb-1.5 pt-3.5 md:px-7">
        <SearchProvider>
          <SearchPill pillId="locations" variant="compact" className="max-w-[820px]" />
        </SearchProvider>
      </div>

      <div
        className={cn(
          'grid min-h-[calc(100vh-104px)]',
          mapOpen ? 'lg:grid-cols-[1.7fr_1fr]' : 'lg:grid-cols-1',
        )}
      >
        {/* LEFT — list */}
        <div className="px-5 pb-24 pt-6 md:px-10">
          <header className="mb-6">
            <span className="font-mono-label mb-2 block text-[12px] tracking-[0.16em] text-gold-dark">
              {properties.length} Stays
            </span>
            <h1 className="font-display text-3xl leading-[1.05] tracking-[-0.02em] md:text-[40px]">
              Stays in Bucharest City Center
            </h1>
            <p className="mt-1.5 max-w-[400px] text-[15px] font-semibold text-ink-60">
              Member rates and fully digital check-in at every AVEXA address across the city.
            </p>
          </header>

          {/* Single-city filter + zone anchors */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-ink bg-ink px-3.5 py-2 text-[12.5px] font-medium text-cream">
              Bucharest City Center
            </span>
            {groups.map((g) => (
              <a
                key={g.neighborhood.id}
                href={`#zone-${g.neighborhood.id}`}
                className="flex items-center gap-1.5 rounded-full border border-gray-line bg-white px-3.5 py-2 text-[12.5px] font-medium transition hover:border-ink hover:bg-cream"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: g.neighborhood.color }}
                />
                {g.neighborhood.label}
                <span className="text-ink-60">{g.items.length}</span>
              </a>
            ))}
          </div>

          {/* Sort row + map toggle */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <span className="text-ink-60">
              Showing all {properties.length} suites · grouped by neighborhood
            </span>
            <button
              type="button"
              onClick={() => setMapOpen((m) => !m)}
              className="hidden items-center gap-2 rounded-full border border-gray-line bg-white px-3.5 py-2 font-semibold transition hover:border-ink lg:inline-flex"
            >
              <Icon name="pin" size={15} />
              {mapOpen ? 'Hide map' : 'Show map'}
            </button>
          </div>

          {/* Promo */}
          <div className="mb-6 flex items-center justify-between gap-4 rounded-[14px] bg-gold px-5 py-3.5 text-[13.5px] text-ink">
            <span>
              As an AVEXA member you get the lowest rate and great perks — for free.{' '}
              <Link href="/login" className="font-semibold underline underline-offset-[3px]">
                Join now
              </Link>
            </span>
          </div>

          {/* Groups */}
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={g.neighborhood.id} id={`zone-${g.neighborhood.id}`} className="scroll-mt-40">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className="mb-5 flex items-center gap-3"
                >
                  <span className="size-2.5 rounded-full" style={{ background: g.neighborhood.color }} />
                  <h2 className="font-display text-xl tracking-[-0.01em]">{g.neighborhood.label}</h2>
                  <span className="font-mono-label text-ink-60">
                    {g.items.length} {g.items.length === 1 ? 'stay' : 'stays'}
                  </span>
                  <span className="h-px flex-1 bg-gray-line" />
                </motion.div>

                <div className="flex flex-col gap-5">
                  {g.items.map((p, i) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      index={i}
                      active={activeId === p.id}
                      onActivate={() => setActiveId(p.id)}
                      onClear={() => setActiveId(null)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* RIGHT — map */}
        {mapOpen && (
          <StylizedMap
            properties={properties}
            activeId={activeId}
            onActivate={setActiveId}
            onClear={() => setActiveId(null)}
          />
        )}
      </div>
    </div>
  );
}
