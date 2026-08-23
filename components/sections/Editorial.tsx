'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Sentences } from '@/components/shared/Sentences';
import { cn } from '@/lib/cn';

/**
 * T1's micro-animation: a battery glyph whose fill grows 0%→100% once it
 * scrolls into view. Static (full) under prefers-reduced-motion.
 */
function BatteryGlyph() {
  const reduceMotion = useReducedMotion();
  return (
    <span
      aria-hidden
      className="relative ml-3 inline-block h-[0.5em] w-[1.2em] align-middle"
    >
      <span className="absolute inset-0 rounded-[3px] border-[1.5px] border-current opacity-70" />
      <span className="absolute top-1/2 -right-[0.16em] h-[0.26em] w-[0.09em] -translate-y-1/2 rounded-r-[1px] bg-current opacity-70" />
      {/* Branch on element type: useReducedMotion flips from null→true AFTER
          mount, and a motion element mounted at scaleX:0 would keep its inline
          transform forever (whileInView never fires) — a plain span can't. */}
      {reduceMotion ? (
        <span className="absolute inset-[2.5px] rounded-[1px] bg-[#7fae7a]" />
      ) : (
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
          className="absolute inset-[2.5px] rounded-[1px] bg-[#7fae7a]"
        />
      )}
    </span>
  );
}

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

const STEPS: { title: string; sub: string; titleVisual?: ReactNode }[] = [
  {
    title: 'Recharge in Bucharest with AVEXA.',
    sub: 'Step inside clinical-grade comfort. Belong to the new, modern way to experience the heart of Bucharest — and recharge.',
    titleVisual: <BatteryGlyph />,
  },
  {
    title: 'Engineered for Focus. Designed for Rest.',
    sub: 'Whether you are closing deals or exploring the historic center, your tech-enabled AVEXA sanctuary is flawlessly prepared for you.',
  },
  {
    title: 'Total Autonomy. Instant Digital Access.',
    sub: 'Your smartphone is your key. Bypass the front desk, avoid the queues, and arrive completely at your own pace.',
  },
  {
    title: "Don't just stay. Belong.",
    sub: 'AVEXIAN Travellers use AVEXA (AVX) Coins to experience MORE. From early check-ins to uniquely curated urban moments.',
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
      {/* Desktop: pinned scroll-story (hidden on mobile). md boundary, matching
          the side image cards below (md:block) — at sm the tunnel would run
          text-only with no images. Skipped entirely under reduced motion —
          the stacked variant below then covers all breakpoints. */}
      {!prefersReducedMotion && (
      <div ref={tunnelRef} className="relative hidden md:block" style={{ height: '400vh' }}>
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
                      // Sequenced, not simultaneous: the outgoing step drops out
                      // fast (200ms) and the incoming one starts after 150ms, so
                      // two headlines are never legible at once (no ghosting).
                      'flex flex-col items-center justify-center transition-all ease-[var(--ease-snap)]',
                      i === current
                        ? 'relative translate-y-0 opacity-100 duration-[450ms] delay-150'
                        : 'pointer-events-none absolute inset-0 translate-y-6 opacity-0 duration-200 delay-0',
                    )}
                  >
                    <h2
                      className="font-display"
                      style={{ fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
                    >
                      <Sentences text={s.title} />
                      {s.titleVisual}
                    </h2>
                    <p className="mt-[18px] max-w-[400px] text-[17px] leading-[1.65] text-ink-80">
                      <Sentences text={s.sub} />
                    </p>
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
          prefersReducedMotion ? 'block' : 'md:hidden',
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
                <Sentences text={s.title} />
                {s.titleVisual}
              </h3>
              <p
                className={cn(
                  'mt-2 text-[14px] leading-[1.55] text-ink-80',
                  alt ? 'ml-7' : 'mr-7',
                )}
              >
                <Sentences text={s.sub} />
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
