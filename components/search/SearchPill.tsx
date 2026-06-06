'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

  // Close on outside click / Escape when this pill owns the open dropdown
  useEffect(() => {
    if (!isThisPillOpen) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closePanel();
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
    : 'Search Bucharest Stays';
  const datesLabel =
    startDate || endDate
      ? `${formatDate(startDate) ?? 'Add date'} – ${formatDate(endDate) ?? 'Add date'}`
      : 'Add dates';

  const fieldBase =
    'group flex flex-1 cursor-pointer flex-col items-start gap-0.5 rounded-full px-6 py-3.5 text-left transition';

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-[860px]', className)}>
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
          <span className="max-w-[160px] truncate text-sm font-semibold text-ink">{locationLabel}</span>
        </button>

        <span className="h-7 w-px bg-gray-line" />

        {/* WHEN */}
        <button
          type="button"
          onClick={() => toggle('dates')}
          className={cn(fieldBase, open('dates') && 'bg-cream')}
        >
          <span className="font-mono-label text-ink">When</span>
          <span className="text-sm font-semibold text-ink">{datesLabel}</span>
        </button>

        <span className="h-7 w-px bg-gray-line" />

        {/* WHO */}
        <button
          type="button"
          onClick={() => toggle('guests')}
          className={cn(fieldBase, open('guests') && 'bg-cream')}
        >
          <span className="font-mono-label text-ink">Who</span>
          <span className="text-sm font-semibold text-ink">{guestSummary(guests)}</span>
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={go}
          aria-label="Search stays"
          className="m-2 grid size-11 place-items-center rounded-full bg-ink text-cream transition hover:scale-105 hover:bg-gold-dark"
        >
          <Icon name="search" size={16} />
        </button>
      </div>

      {/* Dropdowns (z-200 so they paint over later sections) */}
      {open('location') && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[200] w-[320px] rounded-2xl bg-white p-2 shadow-[0_16px_48px_-12px_rgba(25,25,25,0.25)]">
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

      {open('dates') && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-[200] -translate-x-1/2">
          <CalendarPopup
            startDate={startDate}
            endDate={endDate}
            onSelect={(s, e) => {
              setDates(s, e);
              if (s && e) openPanel('guests', pillId); // auto-advance on check-out select
            }}
            onClose={() => openPanel('guests', pillId)}
          />
        </div>
      )}

      {open('guests') && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200]">
          <GuestPopup guests={guests} onChange={setGuests} onClose={closePanel} />
        </div>
      )}
    </div>
  );
}
