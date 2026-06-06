import Link from 'next/link';
import { Icon, type IconName } from '@/components/Icon';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

interface Benefit {
  index: string;
  title: string;
  body: string;
  icon: IconName;
  variant?: 'default' | 'large';
}

const benefits: Benefit[] = [
  {
    index: '01',
    title: 'Best rate. No fine print.',
    body: 'Members always book at the best available rate. We never hide it behind a coupon code.',
    icon: 'sparkles',
    variant: 'large',
  },
  {
    index: '02',
    title: 'Door codes by sunrise.',
    body: 'Self check-in available 24/7. Your code lands by 6 AM on arrival day.',
    icon: 'key',
  },
  {
    index: '03',
    title: 'Free late checkout.',
    body: 'Until 2 PM, no questions. Subject to next-day availability.',
    icon: 'sunrise',
  },
  {
    index: '04',
    title: 'City-grade Wi-Fi.',
    body: '400 Mbps fibre, dedicated workspace, Eames-grade desk chair.',
    icon: 'wifi',
  },
  {
    index: '05',
    title: 'Real coffee, real soap.',
    body: 'Local roasts, refillable amenities, zero plastic miniatures.',
    icon: 'coffee',
  },
  {
    index: '06',
    title: 'Join free. Stay better.',
    body: 'Membership is free. Your first stay unlocks +10% off — forever.',
    icon: 'heart',
    variant: 'large',
  },
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
          <p className="font-mono-label mb-3 text-gold-dark">Member benefits</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl md:text-6xl">Six reasons to book direct.</h2>
            <Link
              href="/member-benefits"
              className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              See all benefits →
            </Link>
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
                  <Icon name={b.icon} size={28} />
                  <span className="font-mono-label">{b.index}</span>
                </div>
                <div className="mt-12">
                  <h3 className="font-display text-2xl">{b.title}</h3>
                  <p
                    className={cn(
                      'mt-3 text-sm',
                      b.variant === 'large' ? 'text-ink/75 group-hover:text-cream/80' : 'text-ink-60',
                    )}
                  >
                    {b.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
