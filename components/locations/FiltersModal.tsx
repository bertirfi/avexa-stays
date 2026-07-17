'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/cn';
import { AMENITY_FILTERS, BEDROOM_OPTIONS } from '@/components/locations/filters';

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  activeAmenities: Set<string>;
  onToggleAmenity: (id: string) => void;
  minBedrooms: number;
  onSetBedrooms: (value: number) => void;
  onClearAll: () => void;
  resultCount: number;
}

export function FiltersModal({
  open,
  onClose,
  activeAmenities,
  onToggleAmenity,
  minBedrooms,
  onSetBedrooms,
  onClearAll,
  resultCount,
}: FiltersModalProps) {
  // Escape closes + body scroll lock while open (same pattern as the mobile map).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="relative flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-line px-6 py-4">
          <h2 className="font-display text-lg">Filters</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-gray-light text-ink transition hover:bg-gray-line"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Amenities */}
          <section>
            <h3 className="font-mono-label mb-3 text-[12px] tracking-[0.14em] text-ink-60">
              Amenities
            </h3>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {AMENITY_FILTERS.map((f) => {
                const active = activeAmenities.has(f.id);
                return (
                  <label
                    key={f.id}
                    className="flex cursor-pointer items-center gap-3 rounded-[10px] px-2 py-2.5 text-[14px] transition hover:bg-cream"
                  >
                    <span
                      className={cn(
                        'grid size-5 shrink-0 place-items-center rounded-[6px] border transition',
                        active
                          ? 'border-ink bg-ink text-cream'
                          : 'border-gray-line bg-white',
                      )}
                    >
                      {active && <Icon name="check" size={13} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={active}
                      onChange={() => onToggleAmenity(f.id)}
                    />
                    {f.label}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Bedrooms */}
          <section className="mt-6">
            <h3 className="font-mono-label mb-3 text-[12px] tracking-[0.14em] text-ink-60">
              Bedrooms
            </h3>
            <div className="flex gap-2">
              {BEDROOM_OPTIONS.map((opt) => {
                const active = minBedrooms === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSetBedrooms(opt.value)}
                    className={cn(
                      'min-w-[64px] rounded-full border px-4 py-2 text-[13.5px] font-medium transition',
                      active
                        ? 'border-ink bg-ink text-cream'
                        : 'border-gray-line bg-white hover:border-ink',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-line px-6 py-4">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[14px] font-medium underline underline-offset-[3px] transition hover:text-ink-60"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ink px-5 py-2.5 text-[14px] font-semibold text-cream transition hover:bg-ink/90"
          >
            Show {resultCount} {resultCount === 1 ? 'stay' : 'stays'}
          </button>
        </div>
      </div>
    </div>
  );
}
