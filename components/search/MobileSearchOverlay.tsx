'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { neighborhoods } from '@/lib/neighborhoods';
import { ymd } from '@/lib/date';
import { cn } from '@/lib/cn';

type CardKey = 'where' | 'when' | 'who';
interface Guests {
  adults: number;
  children: number;
  infants: number;
}

const MAX_OCCUPANTS = 6;
const MAX_INFANTS = 4;
const GUEST_ROWS = [
  { key: 'adults' as const, label: 'Adults', sub: 'Age 13 and above', min: 1 },
  { key: 'children' as const, label: 'Children', sub: 'Ages 2–12', min: 0 },
  { key: 'infants' as const, label: 'Infants', sub: 'Under 2', min: 0 },
];

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  today,
  onPick,
}: {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  today: Date;
  onPick: (d: Date) => void;
}) {
  const offset = (startOfMonth(year, month).getDay() + 6) % 7;
  const total = daysInMonth(year, month);
  const cells: (Date | null)[] = [
    ...Array.from<unknown, Date | null>({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];
  return (
    <div>
      <div className="font-display mb-2 text-lg font-bold">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today && !sameDay(d, today);
          const isStart = startDate && sameDay(d, startDate);
          const isEnd = endDate && sameDay(d, endDate);
          const inRange = startDate && endDate && d > startDate && d < endDate;
          return (
            <button
              type="button"
              key={i}
              disabled={isPast}
              onClick={() => onPick(d)}
              className={cn(
                'aspect-square rounded-full text-[15px] transition',
                isPast && 'cursor-not-allowed text-ink-60/40',
                inRange && 'bg-gold-pale text-ink',
                (isStart || isEnd) && 'bg-ink font-semibold text-cream',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CollapsedRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-[20px] bg-white px-5 py-[18px] text-left shadow-[0_2px_12px_rgba(25,25,25,0.06)]"
    >
      <span className="text-sm text-ink-60">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ open, onClose }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [expanded, setExpanded] = useState<CardKey>('where');
  const [location, setLocation] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<Guests>({ adults: 1, children: 0, infants: 0 });
  const [query, setQuery] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lock background scroll + reset to first card on each open
  useEffect(() => {
    if (!open) return;
    setExpanded('where');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  function pickDate(d: Date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
      return;
    }
    if (d < startDate) {
      setStartDate(d);
      return;
    }
    setEndDate(d);
  }

  function setGuest(key: keyof Guests, delta: number) {
    setGuests((g) => {
      const next = { ...g, [key]: g[key] + delta };
      if (key === 'infants') {
        if (next.infants < 0 || next.infants > MAX_INFANTS) return g;
      } else {
        const row = GUEST_ROWS.find((r) => r.key === key)!;
        if (next[key] < row.min) return g;
        if (next.adults + next.children > MAX_OCCUPANTS) return g;
      }
      return next;
    });
  }

  function monthOffset(off: number) {
    let m = today.getMonth() + off;
    let y = today.getFullYear();
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    return { year: y, month: m };
  }

  function runSearch() {
    const params = new URLSearchParams();
    if (location) params.set('where', location);
    // Local 'YYYY-MM-DD' (lib/date) — toISOString would shift the day in
    // negative-offset timezones, sending the wrong check-in to /locations.
    if (startDate) params.set('checkIn', ymd(startDate));
    if (endDate) params.set('checkOut', ymd(endDate));
    params.set('adults', String(guests.adults));
    params.set('children', String(guests.children));
    params.set('infants', String(guests.infants));
    onClose();
    router.push(`/locations?${params.toString()}`);
  }

  const whereValue = location
    ? neighborhoods.find((n) => n.id === location)?.label ?? location
    : 'Anywhere';
  const whenValue =
    startDate && endDate
      ? `${fmt(startDate)} – ${fmt(endDate)}`
      : startDate
        ? `${fmt(startDate)} – …`
        : 'Add dates';
  const occ = guests.adults + guests.children;
  const whoValue = `${occ} guest${occ === 1 ? '' : 's'}${
    guests.infants ? `, ${guests.infants} infant${guests.infants === 1 ? '' : 's'}` : ''
  }`;

  const filtered = neighborhoods.filter((n) =>
    n.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[300] flex flex-col bg-gray-light text-ink sm:hidden"
        >
          {/* Top bar */}
          <div className="flex flex-shrink-0 justify-end px-4 py-3.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="grid size-10 place-items-center rounded-full border border-gray-line bg-white"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Stacked cards */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
            {/* WHERE */}
            {expanded === 'where' ? (
              <div className="rounded-[20px] bg-white px-5 py-6 shadow-[0_2px_12px_rgba(25,25,25,0.06)]">
                <h3 className="font-display mb-4 text-[26px] font-extrabold">Where?</h3>
                <div className="mb-5 flex items-center gap-2.5 rounded-full border border-gray-line px-4 py-3">
                  <Icon name="search" size={16} className="shrink-0 text-ink-60" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by city, property..."
                    className="w-full bg-transparent outline-none placeholder:text-ink-60"
                  />
                </div>
                <h4 className="font-mono-label mb-1 text-ink-60">AVEXA Locations</h4>
                <ul>
                  {filtered.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setLocation(n.id);
                          setQuery('');
                          setExpanded('when');
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 border-b border-gray-line py-3.5 text-left',
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
                  {filtered.length === 0 && (
                    <li className="py-6 text-center text-sm text-ink-60">No matches.</li>
                  )}
                </ul>
              </div>
            ) : (
              <CollapsedRow label="Where" value={whereValue} onClick={() => setExpanded('where')} />
            )}

            {/* WHEN */}
            {expanded === 'when' ? (
              <div className="rounded-[20px] bg-white px-5 py-6 shadow-[0_2px_12px_rgba(25,25,25,0.06)]">
                <h3 className="font-display mb-4 text-[26px] font-extrabold">When?</h3>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] text-ink-60">
                  {DOW.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="space-y-6">
                  {[0, 1, 2, 3].map((off) => {
                    const { year, month } = monthOffset(off);
                    return (
                      <MonthGrid
                        key={`${year}-${month}`}
                        year={year}
                        month={month}
                        startDate={startDate}
                        endDate={endDate}
                        today={today}
                        onPick={pickDate}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <CollapsedRow label="When" value={whenValue} onClick={() => setExpanded('when')} />
            )}

            {/* WHO */}
            {expanded === 'who' ? (
              <div className="rounded-[20px] bg-white px-5 py-6 shadow-[0_2px_12px_rgba(25,25,25,0.06)]">
                <h3 className="font-display mb-3 text-[26px] font-extrabold">Who?</h3>
                <ul className="divide-y divide-gray-line">
                  {GUEST_ROWS.map((r) => {
                    const val = guests[r.key];
                    const canDec = val > r.min;
                    const canInc =
                      r.key === 'infants'
                        ? val < MAX_INFANTS
                        : guests.adults + guests.children < MAX_OCCUPANTS;
                    return (
                      <li key={r.key} className="flex items-center justify-between py-4">
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
            ) : (
              <CollapsedRow label="Who" value={whoValue} onClick={() => setExpanded('who')} />
            )}
          </div>

          {/* Footer — switches by step (no footer on Where) */}
          {expanded === 'when' && (
            <div
              className="flex flex-shrink-0 items-center justify-between border-t border-gray-line bg-white px-5 pt-3.5"
              style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="text-[15px] font-bold underline underline-offset-2"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setExpanded('who')}
                className="font-display rounded-[12px] bg-ink px-7 py-3.5 text-base font-bold text-cream"
              >
                Next
              </button>
            </div>
          )}
          {expanded === 'who' && (
            <div
              className="flex flex-shrink-0 items-center justify-between border-t border-gray-line bg-white px-5 pt-3.5"
              style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}
            >
              <button
                type="button"
                onClick={() => {
                  setLocation(null);
                  setStartDate(null);
                  setEndDate(null);
                  setGuests({ adults: 1, children: 0, infants: 0 });
                  setQuery('');
                }}
                className="text-[15px] font-bold underline underline-offset-2"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={runSearch}
                className="font-display flex items-center gap-2 rounded-[12px] bg-ink px-7 py-3.5 text-base font-bold text-cream"
              >
                <Icon name="search" size={16} /> Search
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
