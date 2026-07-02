'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { ymd } from '@/lib/date';
import { cn } from '@/lib/cn';

/** Per-night price (RON — money of record) + availability, keyed by
 *  'YYYY-MM-DD'. Optional — when absent the calendar renders plain dates
 *  (e.g. the homepage search pill). */
type PriceByDate = Record<string, { ron: number; available: boolean }>;

interface CalendarPopupProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
  /** Mobile full-screen header back/close button. Defaults to onClose. */
  onBack?: () => void;
  priceByDate?: PriceByDate;
}

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

function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  today,
  onPick,
  priceByDate,
}: {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  today: Date;
  onPick: (d: Date) => void;
  priceByDate?: PriceByDate;
}) {
  const first = startOfMonth(year, month);
  // JS getDay: 0=Sun..6=Sat. Convert so Mon=0, Sun=6:
  const offset = (first.getDay() + 6) % 7;
  const total = daysInMonth(year, month);
  const cells: (Date | null)[] = [
    ...Array.from<unknown, Date | null>({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];
  const hasPrices = !!priceByDate && Object.keys(priceByDate).length > 0;

  return (
    <div>
      <div className="mb-4 text-center font-display text-base font-semibold">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] uppercase tracking-wider text-ink-60">
        {DOW.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today && !sameDay(d, today);
          const info = priceByDate?.[ymd(d)];
          const unavailable = info ? !info.available : false;
          const disabled = isPast || unavailable;
          const price = info?.available ? info.ron : null;
          const isStart = startDate && sameDay(d, startDate);
          const isEnd = endDate && sameDay(d, endDate);
          const inRange =
            startDate && endDate && d > startDate && d < endDate;
          const isEndpoint = isStart || isEnd;

          return (
            <div
              key={i}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                hasPrices ? 'h-14' : 'h-11',
                // Range fill that bridges between cells (no gap-x so the bar is continuous)
                inRange && 'bg-gold-pale/60',
                isStart && endDate && 'bg-gradient-to-r from-transparent from-50% to-gold-pale/60 to-50%',
                isEnd && startDate && 'bg-gradient-to-r from-gold-pale/60 from-50% to-transparent to-50%',
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(d)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-[14px] transition',
                  disabled && 'cursor-not-allowed text-ink-60/40',
                  isPast && 'line-through',
                  !disabled && !isEndpoint && !inRange && 'hover:bg-ink/10 font-medium',
                  inRange && 'text-ink font-medium',
                  isEndpoint && 'bg-ink text-cream font-semibold',
                )}
              >
                {d.getDate()}
              </button>
              {hasPrices && (
                <span
                  className={cn(
                    'pointer-events-none text-[9px] font-medium leading-none',
                    isEndpoint ? 'text-gold-dark' : disabled ? 'text-ink-60/30' : 'text-ink-60',
                  )}
                >
                  {unavailable ? '—' : price != null ? `€${price}` : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Formats a date as "Jun 1" style */
function fmt(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CalendarPopup({
  startDate,
  endDate,
  onSelect,
  onClose,
  onBack,
  priceByDate,
}: CalendarPopupProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show 2 months at a time on desktop, starting from current month
  const [baseMonth, setBaseMonth] = useState(today.getMonth());
  const [baseYear, setBaseYear] = useState(today.getFullYear());

  // Portal mount guard (SSR-safe)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nextMonth = (baseMonth + 1) % 12;
  const nextYear = baseMonth === 11 ? baseYear + 1 : baseYear;

  function shift(delta: number) {
    let m = baseMonth + delta;
    let y = baseYear;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    setBaseMonth(m);
    setBaseYear(y);
  }

  function pick(d: Date) {
    if (!startDate || (startDate && endDate)) {
      onSelect(d, null);
      return;
    }
    if (d < startDate) {
      onSelect(d, null);
      return;
    }
    onSelect(startDate, d);
  }

  const nights =
    startDate && endDate
      ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  // Build 4 consecutive months for mobile scroll view
  function getMonthOffset(offset: number): { year: number; month: number } {
    let m = today.getMonth() + offset;
    let y = today.getFullYear();
    while (m > 11) { m -= 12; y += 1; }
    return { year: y, month: m };
  }

  const rangeLabel =
    startDate && endDate
      ? `${fmt(startDate)} – ${fmt(endDate)} · ${nights} night${nights === 1 ? '' : 's'}`
      : startDate
      ? `${fmt(startDate)} – Add checkout`
      : 'Select dates';

  // ── MOBILE full-screen sheet (portaled) ──
  const mobileSheet = mounted ? createPortal(
    <motion.div
      data-avexa-search-sheet
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed inset-0 z-[300] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center border-b border-gray-line bg-white px-4 py-4">
        <button
          type="button"
          onClick={onBack ?? onClose}
          aria-label="Back"
          className="mr-3 rounded-full p-2 hover:bg-gray-light"
        >
          <Icon name="chevLeft" size={20} />
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-ink">
          {rangeLabel}
        </span>
        {/* spacer to balance the back button */}
        <div className="size-9" />
      </div>

      {/* Scrollable months */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {[0, 1, 2, 3].map((offset) => {
          const { year, month } = getMonthOffset(offset);
          return (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              startDate={startDate}
              endDate={endDate}
              today={today}
              onPick={pick}
              priceByDate={priceByDate}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="border-t border-gray-line bg-white px-4 pt-4"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onSelect(null, null)}
            className="flex-1 rounded-[12px] border border-gray-line py-4 text-sm font-semibold text-ink-60 hover:bg-gray-light"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] rounded-[12px] bg-ink py-4 text-sm font-semibold text-cream hover:bg-gold-dark"
          >
            Confirm
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  ) : null;

  return (
    <>
      {/* ── DESKTOP two-month popup: hidden on mobile ── */}
      <div className="hidden md:block w-[640px] rounded-3xl bg-white p-7 text-ink shadow-[var(--shadow-pill)]">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="rounded-full p-2 hover:bg-gray-light"
          >
            <Icon name="chevLeft" size={18} />
          </button>
          <span className="font-mono-label text-ink-60">
            {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Select dates'}
          </span>
          <button
            onClick={() => shift(1)}
            aria-label="Next month"
            className="rounded-full p-2 hover:bg-gray-light"
          >
            <Icon name="chevRight" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <MonthGrid
            year={baseYear}
            month={baseMonth}
            startDate={startDate}
            endDate={endDate}
            today={today}
            onPick={pick}
            priceByDate={priceByDate}
          />
          <MonthGrid
            year={nextYear}
            month={nextMonth}
            startDate={startDate}
            endDate={endDate}
            today={today}
            onPick={pick}
            priceByDate={priceByDate}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-line pt-5">
          <button
            onClick={() => onSelect(null, null)}
            className="rounded-full px-4 py-2 text-sm text-ink-60 hover:bg-gray-light"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-cream hover:bg-gold hover:text-ink"
          >
            Done
          </button>
        </div>
      </div>

      {/* Mobile sheet rendered via portal */}
      {mobileSheet}
    </>
  );
}
