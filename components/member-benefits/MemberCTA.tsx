import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';

export function MemberCTA() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-[clamp(110px,13vw,180px)] text-center md:px-10">
      <Image
        src="/listing-photos/33-open-streets.jpeg"
        alt=""
        aria-hidden
        fill
        loading="lazy"
        sizes="100vw"
        className="absolute inset-0 z-0 object-cover opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(25,25,25,.4), rgba(25,25,25,.82) 85%), linear-gradient(180deg, rgba(25,25,25,.55), rgba(25,25,25,.7))',
        }}
      />

      <Reveal direction="up" className="relative z-[2] mx-auto max-w-[700px]">
        <h2
          className="font-display text-white"
          style={{ fontSize: 'clamp(36px,5.5vw,64px)', lineHeight: 1 }}
        >
          Elevate your journey
          <span
            aria-hidden
            className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
          />
        </h2>
        <p className="mt-[18px] text-[17px] leading-[1.65] text-white/[0.72]">
          Join the AVEXIAN community today — free, in 30 seconds.
        </p>
        <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-2.5 sm:flex-row sm:gap-3.5">
          <Link
            href="/login"
            className="cta-pulse w-full rounded-full bg-gold px-[34px] py-[18px] text-center text-[15px] font-bold text-ink transition duration-300 hover:translate-x-1 hover:bg-gold-pale sm:w-auto"
          >
            Join free →
          </Link>
          <Link
            href="/locations"
            className="w-full rounded-full border-[1.5px] border-white/55 px-[30px] py-[17px] text-center text-[15px] font-semibold text-white transition duration-300 hover:border-white hover:bg-white hover:text-ink sm:w-auto"
          >
            Browse locations
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
