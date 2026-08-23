'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';

interface StickyBookingBarProps {
  show: boolean;
  propertyName: string;
  /** "Mar 4 – Mar 8" or "Select dates". */
  datesLabel: string;
  /** "From" | "Total". */
  priceLabel: string;
  priceValue: string;
  /** "3 nights · taxes & charges incl." | "per night". */
  note: string;
  ctaLabel: string;
  onBook: () => void;
}

/**
 * Slim booking bar pinned under the nav on tablet/desktop (≥768px) once the
 * sidebar's Book button scrolls out of view (Spec M1.5.1). Below 768px the
 * bottom <MobileBookingBar> owns this job instead.
 *
 * All numbers are passed in from <StayBookingSidebar> — this component never
 * computes money.
 */
export function StickyBookingBar({
  show,
  propertyName,
  datesLabel,
  priceLabel,
  priceValue,
  note,
  ctaLabel,
  onBook,
}: StickyBookingBarProps) {
  const reduceMotion = useReducedMotion();
  const { navHidden, pinned } = useChromeScroll();

  return (
    <AnimatePresence>
      {/* `pinned` (past 60vh, the shared nav threshold) keeps the bar from
          appearing on load when a tall sidebar already clips its own button. */}
      {show && pinned && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          // Sits below the nav, and slides up to the top edge when the nav hides.
          className="fixed inset-x-0 z-40 hidden border-b border-gray-line bg-white/95 shadow-[0_8px_24px_-16px_rgba(25,25,25,0.4)] backdrop-blur transition-[top] duration-300 ease-[var(--ease-snap)] md:block"
          // 76px = the pinned nav's height (same offset the sticky search pill uses).
          style={{ top: navHidden ? 0 : 76 }}
        >
          <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-3 md:px-10">
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-[15px] leading-tight">{propertyName}</p>
              <p className="truncate text-[12px] text-ink-60">{datesLabel}</p>
            </div>

            <div className="shrink-0 text-right">
              <span className="flex items-baseline justify-end gap-1.5">
                <span className="text-[11px] text-ink-60">{priceLabel}</span>
                <span className="font-display text-[19px] text-gold-dark">{priceValue}</span>
              </span>
              <p className="text-[11px] text-ink-60">{note}</p>
            </div>

            <button
              type="button"
              onClick={onBook}
              className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold hover:text-ink"
            >
              {ctaLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
