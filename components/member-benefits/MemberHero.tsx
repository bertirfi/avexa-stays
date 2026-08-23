'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sentences } from '@/components/shared/Sentences';

const ease = [0.16, 1, 0.3, 1] as const;

const words = ['Become', 'an'];

export function MemberHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink px-6 pb-24 pt-44 text-cream md:px-10 md:pt-44">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 25% 40%, rgba(221,185,122,.14), transparent 60%), radial-gradient(ellipse 40% 50% at 80% 60%, rgba(176,136,64,.18), transparent 60%), repeating-linear-gradient(115deg, rgba(255,255,255,.02) 0 2px, transparent 2px 22px), linear-gradient(160deg,#1a1a1a 0%, #0f0f0f 100%)',
        }}
      />

      {/* Photo backdrop */}
      <Image
        src="/listing-photos/00-cover.jpeg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover opacity-[0.42] [filter:saturate(.9)_contrast(1.02)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 72% 62% at 50% 46%, rgba(15,15,15,.22), rgba(15,15,15,.62) 82%), linear-gradient(180deg, rgba(15,15,15,.42) 0%, rgba(15,15,15,.15) 40%, rgba(15,15,15,.72) 100%)',
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[900px] text-center">
        <h1
          className="font-display text-center"
          style={{ fontSize: 'clamp(56px, 10vw, 140px)', lineHeight: 0.96 }}
        >
          {words.map((w, i) => (
            <span key={w}>
              <motion.span
                initial={{ opacity: 0, y: 46 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35 + i * 0.08, ease }}
                className="inline-block"
              >
                {w}
              </motion.span>{' '}
            </span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.59, ease }}
            className="inline-block italic text-gold"
          >
            AVEXIAN Traveller
            <span
              aria-hidden
              className="ml-[0.04em] inline-block size-[0.14em] -translate-y-[0.03em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease }}
          className="mx-auto mt-10 max-w-[520px] text-[17px] font-light leading-[1.65] text-white/65"
        >
          <Sentences text="Unlock Exclusivity & Elevate Every Stay. Free to join, free forever." />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1, ease }}
        >
          <Link
            href="/login"
            className="cta-pulse mt-10 inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-[18px] text-[15px] font-bold text-ink transition duration-300 hover:translate-x-1 hover:bg-gold-pale"
          >
            Join free <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
