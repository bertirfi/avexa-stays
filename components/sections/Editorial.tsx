'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Reveal } from '@/components/Reveal';

const steps = [
  {
    eyebrow: '01',
    title: 'Business or leisure.',
    body: 'Designed for the way you actually travel — whether it\'s a laptop-and-latte workweek or a long weekend with nowhere to be.',
    image: '/listing-photos/00-cover.jpeg',
  },
  {
    eyebrow: '02',
    title: 'Long stay or weekend away.',
    body: 'From a two-night escape to a month-long relocation. Rates that get better the longer you stay.',
    image: '/listing-photos/09-hallway.jpeg',
  },
  {
    eyebrow: '03',
    title: 'The city, on your terms.',
    body: 'Walkable nightlife or a quiet residential street — pick the corner of Bucharest that fits the trip.',
    image: '/listing-photos/30-living-room.jpeg',
  },
  {
    eyebrow: '04',
    title: 'No front desk. No friction. No compromise.',
    body: 'Six neighborhoods. Dozens of spaces. One membership that unlocks them all.',
    image: '/listing-photos/33-open-streets.jpeg',
  },
];

export function Editorial() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Pick which step is highlighted based on scroll progress
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, steps.length - 0.001]);

  return (
    <section
      ref={ref}
      id="editorial"
      className="relative bg-cream"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-[1fr_1.2fr_1fr] md:px-10">
          {/* Left image stack */}
          <div className="relative hidden aspect-[3/4] w-full md:block">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                style={{
                  opacity: useTransform(activeIndex, (v) =>
                    Math.max(0, 1 - Math.abs(v - i) * 1.2),
                  ),
                }}
                className="absolute inset-0"
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="rounded-card object-cover"
                />
              </motion.div>
            ))}
          </div>

          {/* Centered text */}
          <div className="text-center">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                style={{
                  opacity: useTransform(activeIndex, (v) =>
                    Math.max(0, 1 - Math.abs(v - i) * 1.5),
                  ),
                  y: useTransform(activeIndex, (v) => (v - i) * -32),
                }}
                className="absolute inset-x-0"
              >
                <p className="font-mono-label mb-6 text-gold-dark">{s.eyebrow}</p>
                <h2
                  className="font-display"
                  style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
                >
                  {s.title}
                </h2>
                <p className="mx-auto mt-6 max-w-md text-ink/70">{s.body}</p>
              </motion.div>
            ))}

            {/* Step indicator dots */}
            <div className="absolute inset-x-0 -bottom-32 flex justify-center gap-2">
              {steps.map((_, i) => (
                <motion.span
                  key={i}
                  style={{
                    width: useTransform(activeIndex, (v) =>
                      Math.abs(v - i) < 0.5 ? 24 : 8,
                    ),
                  }}
                  className="h-2 rounded-full bg-ink/30 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Right image stack */}
          <div className="relative hidden aspect-[3/4] w-full md:block">
            {steps.map((s, i) => {
              const next = steps[(i + 1) % steps.length];
              return (
                <motion.div
                  key={s.title + '-r'}
                  style={{
                    opacity: useTransform(activeIndex, (v) =>
                      Math.max(0, 1 - Math.abs(v - i) * 1.2),
                    ),
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={next.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="rounded-card object-cover"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile fallback: stacked cards */}
      <div className="md:hidden">
        {steps.map((s, i) => (
          <Reveal key={s.title} direction="up" delay={i * 0.05}>
            <div className="border-t border-gray-line bg-cream px-6 py-20">
              <p className="font-mono-label mb-4 text-gold-dark">{s.eyebrow}</p>
              <h2 className="font-display text-4xl">{s.title}</h2>
              <p className="mt-4 text-ink/70">{s.body}</p>
              <div className="relative mt-8 aspect-[3/4] w-full overflow-hidden rounded-card">
                <Image src={s.image} alt="" fill sizes="100vw" className="object-cover" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
