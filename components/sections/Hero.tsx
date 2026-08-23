'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Sentences } from '@/components/shared/Sentences';

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-visible bg-ink px-6 text-cream"
    >
      {/* Abstract animated gradient background + faded photo backdrop */}
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 80% at 20% 60%, rgba(201,160,94,.12), transparent),' +
              'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(201,160,94,.08), transparent),' +
              'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(201,160,94,.05), transparent),' +
              'linear-gradient(160deg,#1a1a1a 0%,#0f0f0f 100%)',
          }}
        />
        {/* Faded photo backdrop */}
        <Image
          src="/listing-photos/30-living-room.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.18] mix-blend-luminosity"
        />
        <div
          className="absolute -inset-[20%] [animation:drift_18s_ease-in-out_infinite_alternate]"
          style={{
            background:
              'radial-gradient(circle at 30% 70%, rgba(201,160,94,.18), transparent 50%),' +
              'radial-gradient(circle at 70% 40%, rgba(140,106,54,.12), transparent 50%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 45%, transparent, rgba(15,15,15,.4) 80%),' +
              'linear-gradient(0deg, rgba(15,15,15,.5), transparent 30%)',
          }}
        />
      </div>

      {/* Headline */}
      <div className="relative z-10 mx-auto max-w-[1200px] text-center">
        {/* SEO: the page's single h1 carries the primary keyword (CLAUDE.md
            non-negotiable); the display headline below is the client's brand
            copy (Spec M1.5.5) as a styled paragraph. */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono-label mb-4 text-[11px] tracking-[0.25em] text-cream/50"
        >
          Bucharest City Center Apartments
        </motion.h1>
        <p
          className="font-display"
          style={{ fontSize: 'clamp(36px, 6vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          <motion.span
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            Your Bucharest Solution.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="block italic text-gold"
          >
            Feel the modern way.
            <span
              aria-hidden
              className="ml-1 inline-block size-[0.14em] translate-y-[0.18em] rounded-full bg-gold pulse-dot"
            />
          </motion.span>
        </p>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-[520px] text-[15px] leading-relaxed text-cream/60 md:text-base"
        >
          <Sentences text="Best rates are just the beginning. Become an AVEXIAN Traveller. Experience MORE. Unwind completely." />
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="font-mono-label absolute bottom-[18px] left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] text-cream/40"
      >
        Scroll to explore
      </motion.span>
    </section>
  );
}
