'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { CalendarPopup } from '@/components/search/CalendarPopup';
import { GuestPopup } from '@/components/search/GuestPopup';
import { neighborhoods } from '@/lib/neighborhoods';
import type { GuestCounts } from '@/types';
import { cn } from '@/lib/cn';

type Panel = 'location' | 'dates' | 'guests' | null;

interface SearchPillProps {
  variant?: 'hero' | 'compact';
  className?: string;
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function guestSummary(g: GuestCounts) {
  const occ = g.adults + g.children;
  const parts = [`${occ} guest${occ === 1 ? '' : 's'}`];
  if (g.infants > 0) parts.push(`${g.infants} infant${g.infants === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function SearchPill({ variant = 'hero', className }: SearchPillProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [location, setLocation] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const isHero = variant === 'hero';
  const dark = isHero;

  function go() {
    const params = new URLSearchParams();
    if (location) params.set('where', location);
    if (startDate) params.set('checkIn', startDate.toISOString().slice(0, 10));
    if (endDate) params.set('checkOut', endDate.toISOString().slice(0, 10));
    params.set('adults', String(guests.adults));
    params.set('children', String(guests.children));
    params.set('infants', String(guests.infants));
    router.push(`/locations?${params.toString()}`);
  }

  const fieldBase =
    'group flex flex-1 cursor-pointer flex-col items-start gap-1 px-6 py-4 rounded-full transition';

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-[920px]', className)}>
      <div
        className={cn(
          'flex items-center rounded-full shadow-[var(--shadow-pill)] backdrop-blur',
          dark ? 'bg-white/95' : 'bg-white border border-gray-line',
        )}
      >
        {/* Location */}
        <button
          type="button"
          onClick={() => setPanel(panel === 'location' ? null : 'location')}
          className={cn(fieldBase, panel === 'location' && 'bg-gold-pale')}
        >
          <span className="font-mono-label text-ink-60">Where</span>
          <span className="text-sm font-semibold text-ink">
            {location ? neighborhoods.find((n) => n.id === location)?.label ?? location : 'Anywhere in Bucharest'}
          </span>
        </button>

        <span className="h-8 w-px bg-gray-line" />

        {/* Dates */}
        <button
          type="button"
          onClick={() => setPanel(panel === 'dates' ? null : 'dates')}
          className={cn(fieldBase, panel === 'dates' && 'bg-gold-pale')}
        >
          <span className="font-mono-label text-ink-60">Check-in / out</span>
          <span className="text-sm font-semibold text-ink">
            {startDate || endDate
              ? `${formatDate(startDate) ?? 'Add date'} → ${formatDate(endDate) ?? 'Add date'}`
              : 'Any week'}
          </span>
        </button>

        <span className="h-8 w-px bg-gray-line" />

        {/* Guests */}
        <button
          type="button"
          onClick={() => setPanel(panel === 'guests' ? null : 'guests')}
          className={cn(fieldBase, panel === 'guests' && 'bg-gold-pale')}
        >
          <span className="font-mono-label text-ink-60">Who</span>
          <span className="text-sm font-semibold text-ink">{guestSummary(guests)}</span>
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={go}
          aria-label="Search stays"
          className="m-2 grid size-12 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-dark hover:text-cream"
        >
          <Icon name="search" size={18} />
        </button>
      </div>

      {/* Panels */}
      {panel === 'location' && (
        <div className="absolute left-0 top-[110%] z-30 w-[320px] rounded-3xl bg-white p-4 shadow-[var(--shadow-pill)]">
          <h4 className="font-mono-label mb-3 text-ink-60">Neighborhoods</h4>
          <ul className="grid grid-cols-2 gap-2">
            {neighborhoods.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLocation(n.id);
                    setPanel('dates');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-gold-pale"
                >
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ background: n.color }}
                  />
                  <span className="text-sm font-medium">{n.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {panel === 'dates' && (
        <div className="absolute left-1/2 top-[110%] z-30 -translate-x-1/2">
          <CalendarPopup
            startDate={startDate}
            endDate={endDate}
            onSelect={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
            onClose={() => setPanel('guests')}
          />
        </div>
      )}

      {panel === 'guests' && (
        <div className="absolute right-0 top-[110%] z-30">
          <GuestPopup
            guests={guests}
            onChange={setGuests}
            onClose={() => setPanel(null)}
          />
        </div>
      )}
    </div>
  );
}
