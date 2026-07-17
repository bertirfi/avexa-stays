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
import { ymd } from '@/lib/date';
import { cn } from '@/lib/cn';

interface SearchPillProps {
  /** Unique id so two pills can share state but each render its own dropdown. */
  pillId: string;
  variant?: 'hero' | 'compact';
  className?: string;
  /** When set, open this section's popup on mount (used by the header pill). */
  initialSection?: SearchPanel;
  /** Fired right before the search navigation (lets the header pill collapse). */
  onSearch?: () => void;
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

/** Shared "Add dates" / "Jul 04 – Jul 09" label — reused by the header pill. */
export function dateRangeLabel(start: Date | null, end: Date | null) {
  if (!start && !end) return 'Add dates';
  return `${formatDate(start) ?? 'Add date'} – ${formatDate(end) ?? 'Add date'}`;
}

export function guestSummary(g: GuestCounts) {
  const occ = g.adults + g.children;
  const parts = [`${occ} guest${occ === 1 ? '' : 's'}`];
  if (g.infants > 0) parts.push(`${g.infants} infant${g.infants === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

const MAX_OCCUPANTS = 6; // adults + children
const MAX_INFANTS = 4;
const GUEST_ROWS = [
  { key: 'adults' as const, label: 'Adults', sub: 'Age 13 and above', min: 1 },
  { key: 'children' as const, label: 'Children', sub: 'Age 2–12', min: 0 },
  { key: 'infants' as const, label: 'Infants', sub: 'Under 2 years old', min: 0 },
];

export function SearchPill({
  pillId,
  variant = 'hero',
  className,
  initialSection,
  onSearch,
}: SearchPillProps) {
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

  // Header pill expands with a section pre-selected — open it once on mount.
  useEffect(() => {
    if (initialSection) openPanel(initialSection, pillId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Where" full-screen step search input
  const [query, setQuery] = useState('');

  function setGuest(key: keyof GuestCounts, delta: number) {
    const next = { ...guests, [key]: guests[key] + delta };
    if (key === 'infants') {
      if (next.infants < 0 || next.infants > MAX_INFANTS) return;
    } else {
      const row = GUEST_ROWS.find((r) => r.key === key)!;
      if (next[key] < row.min) return;
      if (next.adults + next.children > MAX_OCCUPANTS) return;
    }
    setGuests(next);
  }

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
    if (location && location !== 'all') params.set('where', location);
    // Local 'YYYY-MM-DD' (lib/date) — toISOString would shift the day in
    // negative-offset timezones, sending the wrong check-in to /locations.
    if (startDate) params.set('checkIn', ymd(startDate));
    if (endDate) params.set('checkOut', ymd(endDate));
    params.set('adults', String(guests.adults));
    params.set('children', String(guests.children));
    params.set('infants', String(guests.infants));
    closePanel();
    onSearch?.();
    router.push(`/locations?${params.toString()}`);
  }

  const open = (panel: SearchPanel) => isThisPillOpen && activePanel === panel;
  const locationLabel =
    location === 'all'
      ? 'All locations'
      : location
        ? neighborhoods.find((n) => n.id === location)?.label ?? location
        : 'Search';
  const datesLabel = dateRangeLabel(startDate, endDate);

  const fieldBase =
    'group flex flex-1 min-w-0 cursor-pointer flex-col items-start gap-0.5 rounded-full px-2.5 py-2.5 md:px-6 md:py-3.5 text-left transition';

  // ── Mobile FULL-SCREEN "Where" step (portaled to body) ──
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const mobileWhereStep =
    mounted && open('location')
      ? createPortal(
          <motion.div
            data-avexa-search-sheet
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[300] flex flex-col bg-white text-ink"
          >
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_40px] items-center border-b border-gray-line px-4 py-4">
              <span />
              <h3 className="font-display text-center text-[17px] font-bold">Where</h3>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="grid size-9 place-items-center justify-self-end rounded-full bg-gray-light"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-6 flex items-center gap-2.5 rounded-full border border-gray-line px-4 py-3">
                <Icon name="search" size={16} className="shrink-0 text-ink-60" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by city, property..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink-60"
                />
              </div>
              <h4 className="font-mono-label mb-1 text-ink-60">AVEXA Locations</h4>
              <ul>
                {query.trim() === '' && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation('all');
                        setQuery('');
                        openPanel('dates', pillId);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 border-b border-gray-line py-4 text-left',
                        location === 'all' && 'text-gold-dark',
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream">
                        <Icon name="building" size={16} className="text-ink-60" />
                      </span>
                      <span className="font-semibold">All locations</span>
                      <span className="ml-auto text-xs text-ink-60">Everything</span>
                    </button>
                  </li>
                )}
                {filteredNeighborhoods.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocation(n.id);
                        setQuery('');
                        openPanel('dates', pillId);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 border-b border-gray-line py-4 text-left',
                        location === n.id && 'text-gold-dark',
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream">
                        <Icon name="building" size={16} className="text-ink-60" />
                      </span>
                      <span className="font-semibold">{n.label}</span>
                      <span className="ml-auto text-xs text-ink-60">{n.area}</span>
                    </button>
                  </li>
                ))}
                {filteredNeighborhoods.length === 0 && (
                  <li className="py-6 text-center text-sm text-ink-60">No matches.</li>
                )}
              </ul>
            </div>
          </motion.div>,
          document.body,
        )
      : null;

  // ── Mobile FULL-SCREEN "Guests" step (portaled to body) ──
  const mobileGuestsStep =
    mounted && open('guests')
      ? createPortal(
          <motion.div
            data-avexa-search-sheet
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[300] flex flex-col bg-white text-ink"
          >
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_40px] items-center border-b border-gray-line px-3 py-4">
              <button
                type="button"
                onClick={() => openPanel('dates', pillId)}
                aria-label="Back"
                className="grid size-9 place-items-center rounded-full hover:bg-gray-light"
              >
                <Icon name="chevLeft" size={18} />
              </button>
              <h3 className="font-display text-center text-[17px] font-bold">Guests</h3>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="grid size-9 place-items-center justify-self-end rounded-full bg-gray-light"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="mb-2 flex items-center justify-center gap-2 text-sm text-ink-60">
                <Icon name="info" size={14} /> Max 6 guests capacity
              </p>
              <ul className="divide-y divide-gray-line">
                {GUEST_ROWS.map((r) => {
                  const val = guests[r.key];
                  const canDec = val > r.min;
                  const canInc =
                    r.key === 'infants'
                      ? val < MAX_INFANTS
                      : guests.adults + guests.children < MAX_OCCUPANTS;
                  return (
                    <li key={r.key} className="flex items-center justify-between py-5">
                      <div>
                        <div className="font-display text-base font-bold">{r.label}</div>
                        <div className="text-[13px] text-ink-60">{r.sub}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          aria-label={`Decrease ${r.label}`}
                          disabled={!canDec}
                          onClick={() => setGuest(r.key, -1)}
                          className={cn(
                            'grid size-11 place-items-center rounded-[10px] bg-gray-light text-ink-60 transition',
                            !canDec && 'opacity-30',
                          )}
                        >
                          <Icon name="minus" size={16} />
                        </button>
                        <span className="font-display w-6 text-center text-lg font-bold tabular-nums">
                          {val}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${r.label}`}
                          disabled={!canInc}
                          onClick={() => setGuest(r.key, 1)}
                          className={cn(
                            'grid size-11 place-items-center rounded-[10px] bg-ink text-cream transition',
                            !canInc && 'opacity-30',
                          )}
                        >
                          <Icon name="plus" size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Footer */}
            <div
              className="border-t border-gray-line px-5 pt-3"
              style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={go}
                className="font-display w-full rounded-[12px] bg-ink py-4 text-base font-bold text-cream transition hover:bg-gold-dark"
              >
                Confirm
              </button>
            </div>
          </motion.div>,
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
            <li>
              <button
                type="button"
                onClick={() => {
                  setLocation('all');
                  openPanel('dates', pillId);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-cream',
                  location === 'all' && 'bg-gold-pale text-gold-dark',
                )}
              >
                <span className="size-2 rounded-full bg-ink/40" />
                All locations
              </button>
            </li>
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
            onBack={() => openPanel('location', pillId)}
          />
        </div>
      )}

      {/* GuestPopup desktop popup only — the mobile guests step is full-screen (below). */}
      {open('guests') && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200]">
          <GuestPopup guests={guests} onChange={setGuests} onClose={closePanel} mobileSheet={false} />
        </div>
      )}

      {/* Mobile full-screen search steps portaled to body */}
      {mobileWhereStep}
      {mobileGuestsStep}
    </div>
  );
}
