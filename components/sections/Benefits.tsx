import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

interface Benefit {
  index: string;
  title: string;
  glyph: string;
  variant?: 'default' | 'large';
}

const benefits: Benefit[] = [
  { index: '01', title: 'Enjoy 15% off every booking', glyph: '%', variant: 'large' },
  { index: '02', title: 'Enjoy 25% off 7+ nights', glyph: '7+' },
  { index: '03', title: 'Free cancellation', glyph: '✕' },
  { index: '04', title: 'Early check-in from 2PM', glyph: '2PM' },
  { index: '05', title: 'Late check-out until 1PM', glyph: '1PM' },
  { index: '06', title: 'Welcome drinks & snacks', glyph: '♢', variant: 'large' },
];

export function Benefits() {
  return (
    <section
      id="benefits"
      className="relative isolate overflow-hidden bg-cream py-24 md:py-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('/listing-photos/30-living-room.jpeg')] bg-cover bg-center opacity-[0.08]"
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal direction="up">
          <div className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-mono-label mb-3 text-gold">— Member Club</p>
              <h2 className="font-display text-4xl md:text-6xl">
                Exclusive perks,
                <br />
                <em className="not-italic text-gold">
                  for free
                  <span
                    aria-hidden
                    className="ml-1 inline-block size-[0.14em] -translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
                  />
                </em>
              </h2>
            </div>
            <div>
              <p className="max-w-md text-base text-ink-80">
                Free to join, free forever. The lowest rate we offer is always reserved for members — plus a handful of extras that make every stay softer.
              </p>
              <Link
                href="/login"
                className="cta-pulse mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-dark hover:text-cream"
              >
                Join free <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.index} direction="up" delay={(i % 3) * 0.08}>
              <article
                className={cn(
                  'group flex h-full flex-col justify-between rounded-card p-7 transition duration-500',
                  b.variant === 'large'
                    ? 'bg-gold text-ink hover:bg-gold-dark hover:text-cream'
                    : 'border border-gray-line bg-white hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'grid size-12 place-items-center rounded-2xl font-display text-lg',
                      b.variant === 'large' ? 'bg-ink/10 text-ink' : 'bg-gold-pale text-gold-dark',
                    )}
                  >
                    {b.glyph}
                  </span>
                  <span className="font-mono-label">{b.index}</span>
                </div>
                <h3 className="mt-12 font-display text-3xl">{b.title}</h3>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
