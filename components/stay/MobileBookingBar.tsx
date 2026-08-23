'use client';

import { Icon } from '@/components/Icon';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { cn } from '@/lib/cn';

interface MobileBookingBarProps {
  priceLabel: string;
  priceValue: string;
  taxNote: string;
  ctaLabel: string;
  onBook: () => void;
}

export function MobileBookingBar({
  priceLabel,
  priceValue,
  taxNote,
  ctaLabel,
  onBook,
}: MobileBookingBarProps) {
  const { scrollingDown } = useChromeScroll();

  return (
    <div
      className={cn(
        // <md only — from 768px up, <StickyBookingBar> takes over (Spec M1.5.1).
        'fixed inset-x-0 z-40 flex items-center justify-between gap-3 border-t border-gray-line bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] transition-[bottom] duration-300 ease-[var(--ease-snap)] md:hidden',
        'bottom-0',
        // Tab bar is visible below md when scrolling up / near top — lift the
        // booking bar to sit just above it. While scrolling down the tab bar
        // hides, so the bar drops flush to the bottom.
        !scrollingDown && 'max-md:bottom-[calc(60px+env(safe-area-inset-bottom))]',
      )}
    >
      {/* Left: price badge + tax note */}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[11px] text-ink-60">{priceLabel}</span>
          <span className="rounded-[8px] border border-gold bg-gold-pale px-3 py-1 font-display text-base">
            {priceValue}
          </span>
        </span>
        <span className="flex items-center gap-1 truncate text-[11px] text-ink-60">
          {taxNote}
          <Icon name="info" size={12} className="shrink-0" />
        </span>
      </div>

      {/* Right: CTA button */}
      <button
        type="button"
        onClick={onBook}
        className="shrink-0 rounded-[12px] bg-ink px-6 py-3.5 font-display text-[15px] font-bold text-cream transition hover:bg-gold-dark"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
