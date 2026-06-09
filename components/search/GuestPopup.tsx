'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
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

/** Desktop stepper button — outlined style */
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

/** Mobile stepper button — filled style (+ = dark, - = light) */
function MobileStepperBtn({
  onClick,
  disabled,
  label,
  variant,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  variant: 'inc' | 'dec';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-9 place-items-center rounded-[10px] transition',
        variant === 'inc'
          ? 'bg-ink text-cream border-0'
          : 'bg-gray-light text-ink-60 border-0',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

export function GuestPopup({ guests, onChange, onClose }: GuestPopupProps) {
  // Portal mount guard (SSR-safe)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  // ── MOBILE bottom sheet (portaled) ──
  const mobileSheet = mounted ? createPortal(
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-[290] bg-ink/40"
        onClick={onClose}
      />
      {/* Sheet */}
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

        {/* Capacity info */}
        <p className="mb-4 text-xs text-ink-60">Max 6 guests capacity</p>

        <ul className="divide-y divide-gray-line">
          {rows.map((r) => {
            const val = guests[r.key];
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
                  <MobileStepperBtn
                    label={`Decrease ${r.label}`}
                    onClick={() => set(r.key, -1)}
                    disabled={!canDec}
                    variant="dec"
                  >
                    <Icon name="minus" size={14} />
                  </MobileStepperBtn>
                  <span className="w-6 text-center tabular-nums">{val}</span>
                  <MobileStepperBtn
                    label={`Increase ${r.label}`}
                    onClick={() => set(r.key, 1)}
                    disabled={!canInc}
                    variant="inc"
                  >
                    <Icon name="plus" size={14} />
                  </MobileStepperBtn>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-3 text-sm font-semibold text-ink-60 hover:bg-gray-light"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] rounded-full bg-ink py-3 text-sm font-semibold text-cream hover:bg-gold-dark"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </>,
    document.body,
  ) : null;

  return (
    <>
      {/* ── DESKTOP 320px popup: hidden on mobile ── */}
      <div className="hidden md:block w-[320px] rounded-3xl bg-white p-6 text-ink shadow-[var(--shadow-pill)]">
        <ul className="divide-y divide-gray-line">
          {rows.map((r) => {
            const val = guests[r.key];
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

      {/* Mobile sheet rendered via portal */}
      {mobileSheet}
    </>
  );
}
