'use client';

import { motion } from 'motion/react';
import { SearchPill } from '@/components/search/SearchPill';

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-visible bg-ink text-cream"
    >
      {/* Video placeholder — drop /public/hero.mp4 later */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/listing-photos/00-cover.jpeg')] bg-cover bg-center opacity-25" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 30% 30%, rgba(221,185,122,.18), transparent 60%), radial-gradient(ellipse 50% 40% at 75% 70%, rgba(176,136,64,.22), transparent 60%), linear-gradient(180deg, rgba(15,15,15,.55) 0%, rgba(15,15,15,.25) 35%, rgba(15,15,15,.5) 75%, rgba(15,15,15,.85) 100%)',
          }}
        />
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-[1200px] px-6 pt-40 text-center md:pt-32">
        <motion.h1
          className="font-display"
          style={{ fontSize: 'clamp(56px, 11vw, 168px)' }}
        >
          <motion.span
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            Bucharest City Center,
          </motion.span>{' '}
          <motion.span
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block italic text-gold"
          >
            unlocked
            <span
              aria-hidden
              className="inline-block size-[0.14em] -translate-y-[0.04em] translate-x-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </motion.span>
        </motion.h1>
      </div>

      {/* Search pill anchored near bottom of hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 bottom-24 z-10 mx-auto flex justify-center px-6"
      >
        <SearchPill pillId="hero" variant="hero" />
      </motion.div>

      {/* Scroll cue */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="font-mono-label absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/40"
      >
        Scroll to explore
      </motion.span>
    </section>
  );
}
