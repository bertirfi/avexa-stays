'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Tracks the `prefers-reduced-motion: reduce` media query. Initializes from
 * matchMedia on mount (false during SSR / before hydration, so the desktop
 * scroll-story stays the default) and stays in sync with OS-level changes.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

const STEPS = [
  {
    title: 'Business or leisure.',
    sub: 'Designed for the way you actually travel — whether it\'s a laptop-and-latte workweek or a long weekend with nowhere to be.',
  },
  {
    title: 'Long stay or weekend away.',
    sub: 'From a two-night escape to a month-long relocation. Rates that get better the longer you stay.',
  },
  {
    title: 'The city, on your terms.',
    sub: 'Walkable nightlife or a quiet residential street — pick the corner of Bucharest that fits the trip.',
  },
  {
    title: 'No front desk. No friction. No compromise.',
    sub: 'Six neighborhoods. Dozens of spaces. One membership that unlocks them all.',
  },
];

// LEFT also feeds the mobile stacked variant (one image per step) — keep the
// four strongest, most varied shots here.
const LEFT_IMAGES = [
  '/editorial/01.jpeg',
  '/editorial/03.jpeg',
  '/editorial/07.jpeg',
  '/editorial/06.jpeg',
];

const RIGHT_IMAGES = [
  '/editorial/02.jpeg',
  '/editorial/04.jpeg',
  '/editorial/05.jpeg',
  '/editorial/01B.jpg',
];

export function Editorial() {
  const tunnelRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // The pinned scroll-story is disabled under reduced motion — skip the
    // scroll listener entirely so nothing drives the (unrendered) tunnel.
    if (prefersReducedMotion) return;
    function onScroll() {
      const tunnel = tunnelRef.current;
      if (!tunnel) return;
      const scrollable = tunnel.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setCurrent(0);
        return;
      }
      const scrolled = -tunnel.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const idx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setCurrent((c) => (c === idx ? c : idx));
    }
    const handler = () => requestAnimationFrame(onScroll);
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    onScroll();
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [prefersReducedMotion]);

  function goToStep(i: number) {
    const tunnel = tunnelRef.current;
    if (!tunnel) return;
    const scrollable = tunnel.offsetHeight - window.innerHeight;
    const top = window.scrollY + tunnel.getBoundingClientRect().top;
    window.scrollTo({ top: top + scrollable * ((i + 0.5) / STEPS.length), behavior: 'smooth' });
  }

  return (
    <section id="editorial" className="bg-gold text-ink">
      {/* Desktop: pinned scroll-story (hidden on mobile). Skipped entirely under
          reduced motion — the stacked variant below then covers all breakpoints. */}
      {!prefersReducedMotion && (
      <div ref={tunnelRef} className="relative hidden sm:block" style={{ height: '400vh' }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div
            className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-[1fr_1.4fr_1fr] md:px-10"
            style={{ minHeight: 520 }}
          >
            {/* LEFT images */}
            <div className="relative hidden aspect-[3/4] overflow-hidden rounded-[22px] shadow-[0_32px_64px_-24px_rgba(25,25,25,.3)] md:block">
              {LEFT_IMAGES.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  quality={85}
                  // 2× the card's ~28vw: the card is portrait but the photos are
                  // landscape, so object-cover crops the sides and zooms in —
                  // a file sized to the card width would be upscaled and blurry.
                  sizes="(min-width:768px) 56vw, 0px"
                  className={cn(
                    'object-cover transition-all duration-700 ease-[var(--ease-snap)]',
                    i === current ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0',
                  )}
                />
              ))}
            </div>

            {/* CENTER text */}
            <div className="relative flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="relative w-full">
                {STEPS.map((s, i) => (
                  <div
                    key={s.title}
                    className={cn(
                      'flex flex-col items-center justify-center transition-all duration-[550ms] ease-[var(--ease-snap)]',
                      i === current
                        ? 'relative translate-y-0 opacity-100'
                        : 'pointer-events-none absolute inset-0 translate-y-6 opacity-0',
                    )}
                  >
                    <h2
                      className="font-display"
                      style={{ fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
                    >
                      {s.title}
                    </h2>
                    <p className="mt-[18px] max-w-[400px] text-[17px] leading-[1.65] text-ink-80">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="mt-9 flex gap-2.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={cn(
                      'size-2.5 rounded-full bg-ink transition-all duration-300',
                      i === current ? 'scale-[1.2] opacity-100' : 'opacity-[0.18] hover:opacity-60',
                    )}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT images */}
            <div className="relative hidden aspect-[3/4] overflow-hidden rounded-[22px] shadow-[0_32px_64px_-24px_rgba(25,25,25,.3)] md:block">
              {RIGHT_IMAGES.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  quality={85}
                  // Same crop-zoom compensation as the LEFT card above.
                  sizes="(min-width:768px) 56vw, 0px"
                  className={cn(
                    'object-cover transition-all duration-700 ease-[var(--ease-snap)]',
                    i === current ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Plain editorial stack — no scroll-jack, just scroll through. Mobile
          always; also the desktop fallback when reduced motion is preferred
          (then it drops `sm:hidden` and shows on every breakpoint). */}
      <div
        className={cn(
          'px-6 pb-14 pt-12',
          prefersReducedMotion ? 'block' : 'sm:hidden',
        )}
      >
        <p className="font-mono-label mb-5 text-ink-60">— STAYS THAT FIT THE TRIP</p>
        {STEPS.map((s, i) => {
          const alt = i % 2 === 1;
          return (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-9 last:mb-0"
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-[20px] shadow-[0_20px_40px_-18px_rgba(25,25,25,0.3)]',
                  alt ? 'ml-7 h-[200px]' : 'mr-7 h-[260px]',
                )}
              >
                <Image src={LEFT_IMAGES[i]} alt="" fill quality={85} sizes="100vw" className="object-cover" />
              </div>
              <h3
                className={cn(
                  'font-display mt-3.5 text-[26px] leading-[1.05] tracking-[-0.02em] text-ink',
                  alt ? 'ml-7' : 'mr-7',
                )}
              >
                {s.title}
              </h3>
              <p
                className={cn(
                  'mt-2 text-[14px] leading-[1.55] text-ink-80',
                  alt ? 'ml-7' : 'mr-7',
                )}
              >
                {s.sub}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
