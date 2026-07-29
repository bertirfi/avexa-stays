'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ChromeScrollValue {
  scrollY: number;
  /** True once scrolled past 60vh — nav gets its solid/pinned treatment. */
  pinned: boolean;
  /** True when the pinned nav is hidden (scrolling down); false when scrolling up. */
  navHidden: boolean;
  /**
   * True while the user is scrolling DOWN (and not near the top). Drives the
   * mobile bottom chrome: the tab bar hides and the property booking bar drops
   * flush to the bottom; scrolling up reveals the tab bar with the booking bar
   * stacked above it.
   */
  scrollingDown: boolean;
}

const ChromeScrollContext = createContext<ChromeScrollValue>({
  scrollY: 0,
  pinned: false,
  navHidden: false,
  scrollingDown: false,
});

/**
 * Single source of truth for scroll-driven chrome behavior (v2-app.js parity):
 * - pin the nav after 60vh
 * - hide the nav on scroll-down, show on scroll-up
 * The sticky search pill reads navHidden to slide between top:76px and top:16px.
 */
// Direction flips only after this much *accumulated* travel one way. Mobile
// URL-bar show/hide and touch inertia jitter scrollY by a few px in both
// directions — a raw per-event delta threshold (the old ±4px) made the top
// search pill and bottom tab bar flicker in sync while users scrolled.
const HIDE_TRAVEL = 24;
const SHOW_TRAVEL = 12;

export function ChromeScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChromeScrollValue>({
    scrollY: 0,
    pinned: false,
    navHidden: false,
    scrollingDown: false,
  });
  const lastY = useRef(0);
  const travel = useRef(0);
  const lastDocHeight = useRef(0);

  useEffect(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight;
      // Clamp: iOS rubber-banding reports scrollY beyond the real range.
      const maxY = Math.max(0, docHeight - window.innerHeight);
      const y = Math.min(Math.max(window.scrollY, 0), maxY);
      const pinned = y > window.innerHeight * 0.6;

      // When the document itself changed height (e.g. the mobile search pill
      // collapsing shortens the page), the browser adjusts scrollY without any
      // user intent. Near the bottom of short pages that adjustment read as
      // "scrolling up", which re-expanded the pill, which grew the page again —
      // an infinite show/hide loop. Never derive direction from such an event.
      const docChanged = docHeight !== lastDocHeight.current;
      lastDocHeight.current = docHeight;

      const delta = y - lastY.current;
      lastY.current = y;
      if (docChanged) {
        travel.current = 0;
      } else if (delta !== 0) {
        // Accumulate same-direction travel; a direction change restarts it.
        travel.current =
          Math.sign(delta) === Math.sign(travel.current) ? travel.current + delta : delta;
      }

      setState((prev) => {
        let navHidden = prev.navHidden;
        if (!pinned) navHidden = false;
        else if (travel.current > HIDE_TRAVEL) navHidden = true;
        else if (travel.current < -SHOW_TRAVEL) navHidden = false;

        // Pure scroll direction (not pinned-gated). Always show bottom chrome
        // near the very top of the page.
        let scrollingDown = prev.scrollingDown;
        if (y < 80) scrollingDown = false;
        else if (travel.current > HIDE_TRAVEL) scrollingDown = true;
        else if (travel.current < -SHOW_TRAVEL) scrollingDown = false;

        if (
          prev.scrollY === y &&
          prev.pinned === pinned &&
          prev.navHidden === navHidden &&
          prev.scrollingDown === scrollingDown
        ) {
          return prev;
        }
        return { scrollY: y, pinned, navHidden, scrollingDown };
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <ChromeScrollContext.Provider value={state}>{children}</ChromeScrollContext.Provider>;
}

export function useChromeScroll(): ChromeScrollValue {
  return useContext(ChromeScrollContext);
}
