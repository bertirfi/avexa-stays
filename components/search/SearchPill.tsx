'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { CalendarPopup } from '@/components/search/CalendarPopup';
import { GuestPopup } from '@/components/search/GuestPopup';
import { useSearch, type SearchPanel } from '@/components/search/SearchContext';
import { neighborhoods } from '@/lib/neighborhoods';
import type { GuestCounts } from '@/types';
import { cn } from '@/lib/cn';

interface SearchPillProps {
  /** Unique id so two pills can share state but each render its own dropdown. */
  pillId: string;
  variant?: 'hero' | 'compact';
  className?: string;
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function guestSummary(g: GuestCounts) {
  const occ = g.adults + g.children;
  const parts = [`${occ} guest${occ === 1 ? '' : 's'}`];
  if (g.infants > 0) parts.push(`${g.infants} infant${g.infants === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function SearchPill({ pillId, variant = 'hero', className }: SearchPillProps) {
  const router = useRouter();
  const {
    location,
    startDate,
    endDate,
    guests,
    setLocation,
    setDates,
    setGuests,
    activePanel,
    activePillId,
    openPanel,
    closePanel,
  } = useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const isThisPillOpen = activePillId === pillId;

  // Portal mount guard (SSR-safe)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on outside click / Escape when this pill owns the open dropdown
  useEffect(() => {
    if (!isThisPillOpen) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Element | null;
      // Mobile dropdown sheets are portaled to <body> (outside containerRef);
      // taps inside them must NOT count as an outside click.
      if (target?.closest('[data-avexa-search-sheet]')) return;
      if (containerRef.current && !containerRef.current.contains(target as Node)) closePanel();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isThisPillOpen, closePanel]);

  function toggle(panel: SearchPanel) {
    if (activePanel === panel && isThisPillOpen) {
      closePanel();
      return;
    }
    openPanel(panel, pillId);
    // Auto-scroll the page if the dropdown would extend below the viewport
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dropdownHeight = panel === 'dates' ? 420 : 360;
      const bottomNeeded = rect.bottom + dropdownHeight + 20;
      if (bottomNeeded > window.innerHeight) {
        window.scrollBy({ top: bottomNeeded - window.innerHeight + 40, behavior: 'smooth' });
      }
    });
  }

  function go() {
    const params = new URLSearchParams();
    if (location) params.set('where', location);
    if (startDate) params.set('checkIn', startDate.toISOString().slice(0, 10));
    if (endDate) params.set('checkOut', endDate.toISOString().slice(0, 10));
    params.set('adults', String(guests.adults));
    params.set('children', String(guests.children));
    params.set('infants', String(guests.infants));
    closePanel();
    router.push(`/locations?${params.toString()}`);
  }

  const open = (panel: SearchPanel) => isThisPillOpen && activePanel === panel;
  const locationLabel = location
    ? neighborhoods.find((n) => n.id === location)?.label ?? location
    : 'Search';
  const datesLabel =
    startDate || endDate
      ? `${formatDate(startDate) ?? 'Add date'} – ${formatDate(endDate) ?? 'Add date'}`
      : 'Add dates';

  const fieldBase =
    'group flex flex-1 min-w-0 cursor-pointer flex-col items-start gap-0.5 rounded-full px-2.5 py-2.5 md:px-6 md:py-3.5 text-left transition';

  // ── Mobile location bottom sheet (portaled to body) ──
  // CalendarPopup and GuestPopup render their own mobile portals internally.
  const mobileLocationSheet =
    mounted && open('location')
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-[290] bg-ink/40"
              onClick={closePanel}
            />
            {/* Bottom sheet */}
            <motion.div
              data-avexa-search-sheet
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed inset-x-0 bottom-0 z-[300] rounded-t-[20px] bg-white p-5 text-ink"
              style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
            >
              {/* Grabber */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-line" />
              <h4 className="font-mono-label mb-2 text-ink-60">Bucharest City Center</h4>
              <ul>
                {neighborhoods.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation(n.id);
                        openPanel('dates', pillId);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-cream',
                        location === n.id && 'bg-gold-pale text-gold-dark',
                      )}
                    >
                      <span className="size-2 rounded-full" style={{ background: n.color }} />
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-[860px]', className)}>
      {/* ── Search pill row: visible on every breakpoint ── */}
      <div
        className={cn(
          'flex items-center rounded-full bg-white shadow-[var(--shadow-pill)] backdrop-blur',
          variant === 'compact' && 'border border-gray-line',
        )}
      >
        {/* WHERE */}
        <button
          type="button"
          onClick={() => toggle('location')}
          className={cn(fieldBase, open('location') && 'bg-cream')}
        >
          <span className="font-mono-label text-ink">Where</span>
          <span className="max-w-full truncate text-[13px] font-semibold text-ink md:max-w-[160px] md:text-sm">{locationLabel}</span>
        </button>

        <span className="h-7 w-px bg-gray-line" />

        {/* WHEN */}
        <button
          type="button"
          onClick={() => toggle('dates')}
          className={cn(fieldBase, open('dates') && 'bg-cream')}
        >
          <span className="font-mono-label text-ink">When</span>
          <span className="max-w-full truncate text-[13px] font-semibold text-ink md:text-sm">{datesLabel}</span>
        </button>

        <span className="h-7 w-px bg-gray-line" />

        {/* WHO */}
        <button
          type="button"
          onClick={() => toggle('guests')}
          className={cn(fieldBase, open('guests') && 'bg-cream')}
        >
          <span className="font-mono-label text-ink">Guests</span>
          <span className="max-w-full truncate text-[13px] font-semibold text-ink md:text-sm">{guestSummary(guests)}</span>
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={go}
          aria-label="Search stays"
          className="m-1.5 grid size-10 shrink-0 place-items-center rounded-full bg-ink text-cream transition hover:scale-105 hover:bg-gold-dark md:m-2 md:size-11"
        >
          <Icon name="search" size={16} />
        </button>
      </div>

      {/*
        DROPDOWN STRATEGY:
        - Location: desktop absolute dropdown (hidden md:block) + mobile portaled sheet (handled above via mobileLocationSheet)
        - Dates/Guests: mounted without a hiding wrapper so the component itself can render
          its desktop popup (hidden md:block inside) AND portal its mobile sheet to body (md:hidden on portal root).
          The absolute positioning wrapper is kept for the desktop layout; on mobile it collapses to zero
          because its only child (the desktop popup) is `hidden md:block`.
      */}

      {open('location') && (
        <div className="hidden md:block absolute left-0 top-[calc(100%+8px)] z-[200] w-[320px] rounded-2xl bg-white p-2 text-ink shadow-[0_16px_48px_-12px_rgba(25,25,25,0.25)]">
          <h4 className="font-mono-label px-4 py-3 text-ink-60">Bucharest City Center</h4>
          <ul>
            {neighborhoods.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(n.id);
                    openPanel('dates', pillId);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-cream',
                    location === n.id && 'bg-gold-pale text-gold-dark',
                  )}
                >
                  <span className="size-2 rounded-full" style={{ background: n.color }} />
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CalendarPopup: the absolute wrapper positions the desktop popup.
          The component also portals a mobile full-screen sheet to body (md:hidden). */}
      {open('dates') && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-[200] -translate-x-1/2">
          <CalendarPopup
            startDate={startDate}
            endDate={endDate}
            onSelect={(s, e) => {
              setDates(s, e);
              if (s && e) openPanel('guests', pillId);
            }}
            onClose={() => openPanel('guests', pillId)}
          />
        </div>
      )}

      {/* GuestPopup: same pattern — absolute wrapper for desktop, portal for mobile. */}
      {open('guests') && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200]">
          <GuestPopup guests={guests} onChange={setGuests} onClose={closePanel} />
        </div>
      )}

      {/* Mobile location bottom sheet portaled to body */}
      {mobileLocationSheet}
    </div>
  );
}
