'use client';

import { motion } from 'motion/react';
import { SearchPill } from '@/components/search/SearchPill';

const words = ['Live', 'the', 'city.'];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink text-cream"
    >
      {/* Video placeholder — drop a real loop into /public/hero.mp4 later */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/listing-photos/00-cover.jpeg')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink" />
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-[1200px] px-6 pt-40 text-center md:pt-32">
        <p className="font-mono-label mb-8 text-gold/90">
          <span aria-hidden className="inline-block size-2 rounded-full bg-gold align-middle pulse-dot" />
          <span className="ml-2 align-middle">Bucharest · Members &amp; Guests</span>
        </p>

        <h1
          className="font-display"
          style={{ fontSize: 'clamp(56px, 9vw, 132px)' }}
        >
          {words.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.15 + i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mr-4 inline-block"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mx-auto mt-6 max-w-xl text-lg text-cream/80"
        >
          Apartments, suites and residences in the heart of Bucharest. Booked direct, kept honest.
        </motion.p>
      </div>

      {/* Search pill */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 w-full px-6"
      >
        <div className="mx-auto">
          <SearchPill variant="hero" className="mx-auto" />
        </div>
      </motion.div>

      {/* Bottom stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="mt-auto w-full pb-12 pt-24"
      >
        <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-8 font-mono-label text-cream/70">
          <li>8 Suites</li>
          <li>1 Neighborhood live</li>
          <li>5 more arriving</li>
          <li>0% middleman fees</li>
        </ul>
      </motion.div>
    </section>
  );
}
