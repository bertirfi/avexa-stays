'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/Icon';
import {
  SearchPill,
  dateRangeLabel,
  guestSummary,
} from '@/components/search/SearchPill';
import { useSearch, type SearchPanel } from '@/components/search/SearchContext';
import { neighborhoods } from '@/lib/neighborhoods';
import { cn } from '@/lib/cn';

interface HeaderSearchProps {
  /** Lets the Nav keep the header pinned (not hide on scroll) while expanded. */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Airbnb-style header search: a compact mini-pill sits in the nav centre and,
 * on clicking any of its three segments, expands into the full <SearchPill>
 * (Where / When / Guests) over a dimmed page. It reuses SearchPill's own logic
 * and popups — this component only handles the compact display + expand/collapse
 * shell. Desktop-only; the mobile search UX lives in MobileSearchHeader.
 */
export function HeaderSearch({ onExpandedChange }: HeaderSearchProps) {
  const { location, startDate, endDate, guests, closePanel } = useSearch();
  const [section, setSection] = useState<SearchPanel | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const expanded = section !== null;

  useEffect(() => setMounted(true), []);
  useEffect(() => onExpandedChange?.(expanded), [expanded, onExpandedChange]);

  const collapse = useCallback(() => {
    setSection(null);
    closePanel();
  }, [closePanel]);

  // While expanded: Escape collapses (SearchPill also closes its open popup),
  // and background scroll is locked — this also keeps the homepage nav pinned so
  // the pill can't unmount mid-expand if the user scrolls back to the top.
  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') collapse();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [expanded, collapse]);

  const locationLabel =
    location === 'all'
      ? 'All locations'
      : location
        ? neighborhoods.find((n) => n.id === location)?.label ?? location
        : 'Search';
  const hasLocation = location !== '';
  const hasDates = !!(startDate || endDate);
  const datesLabel = dateRangeLabel(startDate, endDate);

  const segments: { key: SearchPanel; label: string; muted: boolean; grow?: boolean }[] = [
    { key: 'location', label: locationLabel, muted: !hasLocation, grow: true },
    { key: 'dates', label: datesLabel, muted: !hasDates },
    { key: 'guests', label: guestSummary(guests), muted: false },
  ];

  return (
    <>
      {/* Compact mini-pill (hidden while expanded so it doesn't ghost behind) */}
      {!expanded && (
        <div className="flex min-w-0 items-center rounded-full border border-gray-line bg-white shadow-[var(--shadow-pill)]">
          {segments.map((seg, i) => (
            <div key={seg.key} className={cn('flex min-w-0 items-center', seg.grow && 'min-w-0')}>
              {i > 0 && <span className="h-5 w-px shrink-0 bg-gray-line" />}
              <button
                type="button"
                onClick={() => setSection(seg.key)}
                className={cn(
                  'truncate rounded-full px-3.5 py-2 text-left text-[13px] font-semibold transition hover:bg-cream',
                  seg.key === 'location' ? 'max-w-[150px]' : 'max-w-[130px]',
                  seg.muted ? 'text-ink-60' : 'text-ink',
                )}
              >
                {seg.label}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSection('location')}
            aria-label="Search stays"
            className="m-1 grid size-8 shrink-0 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-dark hover:text-cream"
          >
            <Icon name="search" size={14} />
          </button>
        </div>
      )}

      {/* Expanded: dim overlay + full pill, portaled to body (the header uses a
          transform, which would otherwise trap position:fixed children). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {expanded && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  onClick={collapse}
                  className="fixed inset-0 z-[55] bg-ink/30"
                  aria-hidden
                />
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.98, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed left-1/2 top-3 z-[60] w-[min(860px,calc(100%-32px))] -translate-x-1/2"
                >
                  <SearchPill
                    pillId="header"
                    variant="compact"
                    initialSection={section ?? undefined}
                    onSearch={collapse}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
