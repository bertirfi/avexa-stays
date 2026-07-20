'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { PropertyCard } from '@/components/locations/PropertyCard';
import { StylizedMap } from '@/components/locations/StylizedMap';
import { LocationsMap } from '@/components/locations/LocationsMap';
import { FiltersModal } from '@/components/locations/FiltersModal';
import { QUICK_FILTERS, matchesFilters } from '@/components/locations/filters';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import { neighborhoods } from '@/lib/neighborhoods';
import { cn } from '@/lib/cn';
import type { Property } from '@/types';

export function LocationsView({ properties }: { properties: Property[] }) {
  const { format } = useCurrency();
  const [activeId, setActiveId] = useState<string | null>(null);
  // Mobile-only List/Map toggle state
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [popupId, setPopupId] = useState<string | null>(null);
  const { scrollingDown } = useChromeScroll();

  // ── Filters ──────────────────────────────────────────────────
  const [activeAmenities, setActiveAmenities] = useState<Set<string>>(new Set());
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleAmenity = (id: string) =>
    setActiveAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const clearFilters = () => {
    setActiveAmenities(new Set());
    setMinBedrooms(0);
  };
  const activeCount = activeAmenities.size + (minBedrooms > 0 ? 1 : 0);

  const filtered = useMemo(
    () => properties.filter((p) => matchesFilters(p, activeAmenities, minBedrooms)),
    [properties, activeAmenities, minBedrooms],
  );

  // Lock body scroll while the full-screen mobile map is open
  useEffect(() => {
    if (mobileView !== 'map') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileView]);

  // Desktop: the active pin follows the card nearest the viewport center as you
  // scroll the list (Airbnb-style), in addition to hover.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const cards = filtered
      .map((p) => document.getElementById(`loc-card-${p.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const focused = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (focused) setActiveId(focused.target.id.replace('loc-card-', ''));
      },
      { rootMargin: '-32% 0px -48% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [filtered]);

  const popupProperty = popupId
    ? (properties.find((p) => p.id === popupId) ?? null)
    : null;

  const groups = neighborhoods
    .map((n) => ({
      neighborhood: n,
      items: filtered.filter((p) => p.neighborhood === n.id),
    }))
    .filter((g) => g.items.length > 0);

  // Real Google map when a key is configured + coordinates exist; otherwise the
  // decorative map. Both share the same props, so it's a drop-in swap.
  const hasMaps =
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) &&
    properties.some((p) => p.coordinates);
  const MapComponent = hasMaps ? LocationsMap : StylizedMap;

  return (
    <div className="bg-cream">
      <div className="grid min-h-[calc(100dvh-104px)] lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        {/* LEFT — list */}
        <div
          className={cn(
            'min-w-0 px-5 pb-24 pt-6 md:px-10',
            mobileView === 'map' && 'max-sm:hidden',
          )}
        >
          {/* Cap list width so single-column cards stay sane on wide screens */}
          <div className="mx-auto w-full max-w-[840px]">
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
            <span className="rounded-full border border-ink bg-ink px-4 py-2.5 text-[13.5px] font-medium text-cream">
              Bucharest City Center
            </span>
            {groups.map((g) => (
              <a
                key={g.neighborhood.id}
                href={`#zone-${g.neighborhood.id}`}
                className="flex items-center gap-1.5 rounded-full border border-gray-line bg-white px-4 py-2.5 text-[13.5px] font-medium transition hover:border-ink hover:bg-cream"
              >
                {g.neighborhood.label}
                <span className="text-ink-60">{g.items.length}</span>
              </a>
            ))}
          </div>

          {/* Filters — button + quick amenity pills */}
          <div className="no-scrollbar mb-4 flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-full border border-gray-line bg-white px-4 py-2.5 text-[13.5px] font-medium transition hover:border-ink hover:bg-cream"
            >
              <Icon name="sliders" size={15} />
              Filters
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-semibold text-cream">
                  {activeCount}
                </span>
              )}
            </button>

            <span className="h-6 w-px shrink-0 bg-gray-line" />

            {QUICK_FILTERS.map((f) => {
              const active = activeAmenities.has(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleAmenity(f.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13.5px] font-medium transition',
                    active
                      ? 'border-ink bg-ink text-cream'
                      : 'border-gray-line bg-white hover:border-ink hover:bg-cream',
                  )}
                >
                  {active && <Icon name="check" size={14} />}
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <div className="mb-6 text-[13px] text-ink-60">
            {activeCount > 0
              ? `Showing ${filtered.length} of ${properties.length} suites`
              : `Showing all ${properties.length} suites · grouped by neighborhood`}
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

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-[16px] border border-gray-line bg-white px-6 py-12 text-center">
              <p className="font-display text-lg">No stays match these filters.</p>
              <p className="mt-1.5 text-[14px] text-ink-60">
                Try removing a filter to see more of the city.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-[14px] font-semibold text-cream transition hover:bg-ink/90"
              >
                Clear all filters
              </button>
            </div>
          )}

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
        </div>

        {/* RIGHT — map (desktop split view, always visible on lg+) */}
        <MapComponent
          properties={filtered}
          activeId={activeId}
          onActivate={setActiveId}
          onClear={() => setActiveId(null)}
        />
      </div>

      {/* ── MOBILE full-screen map overlay (≤ sm) ── */}
      <div
        className={cn(
          'fixed inset-0 z-[140] sm:hidden',
          mobileView === 'map' ? 'block' : 'hidden',
        )}
      >
        <MapComponent
          variant="mobile"
          properties={filtered}
          activeId={activeId}
          onActivate={setActiveId}
          onClear={() => setActiveId(null)}
          onPinTap={(id) => setPopupId(id)}
        />

        {/* Pin popup card */}
        {popupProperty && (
          <div className="absolute inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[145] rounded-[16px] border border-gray-line bg-white p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setPopupId(null)}
              className="absolute right-2.5 top-2.5 z-10 grid size-7 place-items-center rounded-full bg-gray-light text-ink transition hover:bg-gray-line"
            >
              <Icon name="x" size={14} />
            </button>
            <Link href={`/locations/${popupProperty.slug}`} className="flex gap-3">
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-[12px] bg-gray-light">
                <Image
                  src={popupProperty.cover}
                  alt={popupProperty.name}
                  fill
                  sizes="84px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 pr-6">
                <span
                  className="block text-[12px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: popupProperty.neighborhoodColor }}
                >
                  {popupProperty.neighborhoodLabel}
                </span>
                <h4 className="font-display mt-0.5 truncate text-base">{popupProperty.name}</h4>
                <p className="truncate text-xs text-ink-60">{popupProperty.tagline}</p>
                <span className="mt-1 inline-flex items-baseline gap-1 font-display text-[15px]">
                  {format(popupProperty.rates[0].perNight)}
                  <span className="text-[11px] font-medium text-ink-60">/night</span>
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ── MOBILE List / Map toggle pill (≤ sm) ── */}
      <div
        className={cn(
          'fixed left-1/2 z-[150] flex -translate-x-1/2 gap-0.5 rounded-full bg-ink p-1 shadow-[0_8px_24px_rgba(25,25,25,0.35)] transition-[bottom] duration-300 ease-[var(--ease-snap)] sm:hidden',
          mobileView === 'map'
            ? 'bottom-[calc(16px+env(safe-area-inset-bottom))]'
            : scrollingDown
              ? 'bottom-[calc(12px+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(72px+env(safe-area-inset-bottom))]',
        )}
      >
        <button
          type="button"
          onClick={() => {
            setMobileView('list');
            setPopupId(null);
          }}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition',
            mobileView === 'list' ? 'bg-white text-ink' : 'text-white/60',
          )}
        >
          <Icon name="menu" size={16} />
          List
        </button>
        <button
          type="button"
          onClick={() => setMobileView('map')}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition',
            mobileView === 'map' ? 'bg-white text-ink' : 'text-white/60',
          )}
        >
          <Icon name="pin" size={16} />
          Map
        </button>
      </div>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        activeAmenities={activeAmenities}
        onToggleAmenity={toggleAmenity}
        minBedrooms={minBedrooms}
        onSetBedrooms={setMinBedrooms}
        onClearAll={clearFilters}
        resultCount={filtered.length}
      />
    </div>
  );
}
