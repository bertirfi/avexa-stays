'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { cn } from '@/lib/cn';

/**
 * Home-only "Book now" pill that appears once the hero is behind you
 * (Spec M1.5.1). `pinned` is the shared 60vh threshold the nav already uses —
 * one scroll listener for the whole app.
 *
 * Bottom-right on desktop; on mobile it sits above the tab bar and drops with
 * it when the bar hides on scroll-down, matching <MobileBookingBar>.
 */
export function StickyBookNow() {
  const { pinned, scrollingDown } = useChromeScroll();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {pinned && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.34, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'fixed right-4 z-40 transition-[bottom] duration-300 ease-[var(--ease-snap)] md:right-8',
            scrollingDown
              ? 'bottom-[calc(16px+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-8',
          )}
        >
          <Link
            href="/locations"
            className="flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-display text-[15px] font-bold text-ink shadow-[0_10px_30px_-8px_rgba(25,25,25,0.45)] transition hover:bg-ink hover:text-cream"
          >
            <Icon name="calendar" size={16} strokeWidth={2} />
            Book now
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
