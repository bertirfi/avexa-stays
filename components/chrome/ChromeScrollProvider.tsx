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
}

const ChromeScrollContext = createContext<ChromeScrollValue>({
  scrollY: 0,
  pinned: false,
  navHidden: false,
});

/**
 * Single source of truth for scroll-driven chrome behavior (v2-app.js parity):
 * - pin the nav after 60vh
 * - hide the nav on scroll-down, show on scroll-up
 * The sticky search pill reads navHidden to slide between top:76px and top:16px.
 */
export function ChromeScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChromeScrollValue>({
    scrollY: 0,
    pinned: false,
    navHidden: false,
  });
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      const pinned = y > window.innerHeight * 0.6;

      setState((prev) => {
        let navHidden = prev.navHidden;
        if (pinned) {
          if (delta > 4) navHidden = true;
          else if (delta < -4) navHidden = false;
        } else {
          navHidden = false;
        }
        if (prev.scrollY === y && prev.pinned === pinned && prev.navHidden === navHidden) {
          return prev;
        }
        return { scrollY: y, pinned, navHidden };
      });
      lastY.current = y;
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
