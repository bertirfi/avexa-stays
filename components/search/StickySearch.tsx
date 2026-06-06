'use client';

import { useEffect, useState } from 'react';
import { SearchPill } from '@/components/search/SearchPill';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { cn } from '@/lib/cn';

/**
 * The second homepage search pill. It fades in once you scroll past the hero
 * and its `top` slides between 76px (nav visible) and 16px (nav hidden),
 * staying perfectly synced with the nav's hide/show animation.
 */
export function StickySearch() {
  const { scrollY, navHidden } = useChromeScroll();
  const [heroBottom, setHeroBottom] = useState(0);

  useEffect(() => {
    function measure() {
      const hero = document.getElementById('top');
      setHeroBottom(hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const visible = heroBottom > 0 && scrollY > heroBottom - 140;

  return (
    <div
      className={cn(
        'fixed left-1/2 z-[55] hidden w-[min(860px,calc(100%-32px))] -translate-x-1/2 transition-[top,opacity] duration-[400ms] ease-[var(--ease-snap)] md:block',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      style={{ top: navHidden ? 16 : 76 }}
    >
      <SearchPill pillId="sticky" variant="compact" />
    </div>
  );
}
