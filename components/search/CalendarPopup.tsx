'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/cn';

interface CalendarPopupProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date | null, end: Date | null) => void;
  onClose: () => void;
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
}: {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  today: Date;
  onPick: (d: Date) => void;
}) {
  const first = startOfMonth(year, month);
  // JS getDay: 0=Sun..6=Sat. Convert so Mon=0, Sun=6:
  const offset = (first.getDay() + 6) % 7;
  const total = daysInMonth(year, month);
  const cells: (Date | null)[] = [
    ...Array.from<unknown, Date | null>({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div>
      <div className="mb-3 px-2 font-display text-lg">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 px-2 text-center text-[11px] text-ink-60">
        {DOW.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 px-2">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today && !sameDay(d, today);
          const isStart = startDate && sameDay(d, startDate);
          const isEnd = endDate && sameDay(d, endDate);
          const inRange =
            startDate && endDate && d > startDate && d < endDate;

          return (
            <button
              type="button"
              key={i}
              disabled={isPast}
              onClick={() => onPick(d)}
              className={cn(
                'aspect-square rounded-full text-sm transition',
                isPast && 'text-ink-60/40 cursor-not-allowed',
                !isPast && !isStart && !isEnd && !inRange && 'hover:bg-gold-pale',
                inRange && 'bg-gold-pale text-ink',
                (isStart || isEnd) && 'bg-ink text-cream font-semibold',
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

export function CalendarPopup({
  startDate,
  endDate,
  onSelect,
  onClose,
}: CalendarPopupProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Show 2 months at a time, starting from current month
  const [baseMonth, setBaseMonth] = useState(today.getMonth());
  const [baseYear, setBaseYear] = useState(today.getFullYear());

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

  return (
    <div className="rounded-3xl bg-white p-6 text-ink shadow-[var(--shadow-pill)]">
      <div className="mb-4 flex items-center justify-between">
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

      <div className="grid gap-6 md:grid-cols-2">
        <MonthGrid
          year={baseYear}
          month={baseMonth}
          startDate={startDate}
          endDate={endDate}
          today={today}
          onPick={pick}
        />
        <MonthGrid
          year={nextYear}
          month={nextMonth}
          startDate={startDate}
          endDate={endDate}
          today={today}
          onPick={pick}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
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
  );
}
