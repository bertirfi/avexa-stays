'use client';

import { Icon } from '@/components/Icon';
import type { GuestCounts } from '@/types';
import { cn } from '@/lib/cn';

interface GuestPopupProps {
  guests: GuestCounts;
  onChange: (g: GuestCounts) => void;
  onClose: () => void;
}

const MAX_OCCUPANTS = 6; // adults + children
const MAX_INFANTS = 4;

const rows = [
  {
    key: 'adults' as const,
    label: 'Adults',
    sub: 'Ages 13 or above',
    min: 1,
  },
  {
    key: 'children' as const,
    label: 'Children',
    sub: 'Ages 2–12',
    min: 0,
  },
  {
    key: 'infants' as const,
    label: 'Infants',
    sub: 'Under 2',
    min: 0,
  },
];

function StepperBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-8 place-items-center rounded-full border border-gray-line transition',
        disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-ink hover:bg-cream',
      )}
    >
      {children}
    </button>
  );
}

export function GuestPopup({ guests, onChange, onClose }: GuestPopupProps) {
  function set(key: keyof GuestCounts, delta: number) {
    const next = { ...guests, [key]: guests[key] + delta };

    if (key === 'infants') {
      if (next.infants < 0 || next.infants > MAX_INFANTS) return;
    } else {
      if (next[key] < rows.find((r) => r.key === key)!.min) return;
      if (next.adults + next.children > MAX_OCCUPANTS) return;
    }

    onChange(next);
  }

  return (
    <div className="w-[320px] rounded-3xl bg-white p-6 shadow-[var(--shadow-pill)]">
      <ul className="divide-y divide-gray-line">
        {rows.map((r) => {
          const val = guests[r.key];
          const max = r.key === 'infants' ? MAX_INFANTS : MAX_OCCUPANTS;
          const canDec = val > r.min;
          const canInc =
            r.key === 'infants'
              ? val < MAX_INFANTS
              : guests.adults + guests.children < MAX_OCCUPANTS;

          return (
            <li key={r.key} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{r.label}</div>
                <div className="text-xs text-ink-60">{r.sub}</div>
              </div>
              <div className="flex items-center gap-3">
                <StepperBtn
                  label={`Decrease ${r.label}`}
                  onClick={() => set(r.key, -1)}
                  disabled={!canDec}
                >
                  <Icon name="minus" size={14} />
                </StepperBtn>
                <span className="w-6 text-center tabular-nums">{val}</span>
                <StepperBtn
                  label={`Increase ${r.label}`}
                  onClick={() => set(r.key, 1)}
                  disabled={!canInc}
                >
                  <Icon name="plus" size={14} />
                </StepperBtn>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex justify-end">
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
