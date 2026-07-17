'use client';

import { Icon } from '@/components/Icon';
import { dateRangeLabel, guestSummary } from '@/components/search/SearchPill';
import { useSearch, type SearchPanel } from '@/components/search/SearchContext';
import { neighborhoods } from '@/lib/neighborhoods';
import { cn } from '@/lib/cn';

/**
 * Compact mini search pill shown in the nav centre once the page is scrolled
 * (Airbnb-style). Clicking any segment asks the Nav to expand the header back
 * to its big two-row state with that section's popup open.
 */
export function MiniSearchPill({ onSelect }: { onSelect: (section: SearchPanel) => void }) {
  const { location, startDate, endDate, guests } = useSearch();

  const locationLabel =
    location === 'all'
      ? 'All locations'
      : location
        ? neighborhoods.find((n) => n.id === location)?.label ?? location
        : 'Search';
  const hasLocation = location !== '';
  const hasDates = !!(startDate || endDate);

  const segments: { key: SearchPanel; label: string; muted: boolean }[] = [
    { key: 'location', label: locationLabel, muted: !hasLocation },
    { key: 'dates', label: dateRangeLabel(startDate, endDate), muted: !hasDates },
    { key: 'guests', label: guestSummary(guests), muted: false },
  ];

  return (
    <div className="flex min-w-0 items-center rounded-full border border-gray-line bg-white shadow-[var(--shadow-pill)]">
      {segments.map((seg, i) => (
        <div key={seg.key} className="flex min-w-0 items-center">
          {i > 0 && <span className="h-5 w-px shrink-0 bg-gray-line" />}
          <button
            type="button"
            onClick={() => onSelect(seg.key)}
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
        onClick={() => onSelect('location')}
        aria-label="Search stays"
        className="m-1 grid size-8 shrink-0 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-dark hover:text-cream"
      >
        <Icon name="search" size={14} />
      </button>
    </div>
  );
}
