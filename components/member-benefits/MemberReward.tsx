import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { Sentences } from '@/components/shared/Sentences';
import { cn } from '@/lib/cn';

interface Tier {
  name: string;
  progress: string;
  earn: string;
  unlock: string;
  hero?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'BASIC',
    progress: 'Just signed up',
    earn: '—',
    unlock: 'Your journey starts here — book your first stay to go BRONZE and start earning.',
  },
  {
    name: 'BRONZE',
    progress: 'Your first stay',
    earn: '5%',
    unlock: 'Initiation: start building your AVEXIAN Vault. Your earned AVX Coins will be ready to use on your next visit.',
  },
  {
    name: 'SILVER',
    progress: '2 stays & 5 nights',
    earn: '8%',
    unlock: 'Flexibility Unlocked: Early Check-in, Late Check-out & more join your AVEXIAN Vault.',
  },
  {
    name: 'GOLD',
    progress: '3 stays & 10 nights',
    earn: '10%',
    unlock: 'Comfort Unlocked: Exclusive Welcome Box, Luggage Drop, Mid-stay Cleaning, Birthday & Anniversary Packages & many more.',
  },
  {
    name: 'PLATINUM',
    progress: '5 stays & 20 nights',
    earn: '12.5%',
    unlock: 'Executive Unlocked: 24/7 Parking access, Airport Transfer, Spa & Relaxation — plus the exclusive power to pay for your stay with AVX (2 AVX = 1 RON).',
  },
  {
    name: 'DIAMOND HERO',
    progress: '7 stays & 35 nights',
    earn: '15%',
    unlock: 'All-Inclusive Power: spend your AVX on absolutely anything — every upsell included, and the exclusive right to pay for bookings (2 AVX = 1 RON) — plus an exclusive physical gift upon arrival.',
    hero: true,
  },
];

const footnotes = [
  'Coins are earned on the net accommodation value (excluding VAT, city tax, cleaning and upsells).',
  'Coins become active 24 hours after check-out.',
  'Coins expire 12 months after activation. We remind you 30 days before.',
  'Spend AVX on your unlocked upsells at every earning tier — 1 AVX = 1 RON.',
  'PLATINUM & DIAMOND HERO exclusive: pay for the stay itself with AVX — 2 AVX = 1 RON.',
  'Consecutive back-to-back bookings merge into a single stay for tier progress.',
  'Only completed stays count. Coins are personal, non-transferable and have no cash value.',
];

export function MemberTiers() {
  return (
    <section className="bg-ink py-[clamp(80px,10vw,140px)] text-white">
      <div className="mx-auto max-w-[1000px] px-4 md:px-10">
        <Reveal direction="up" className="mb-12 text-center">
          <p className="font-mono-label text-gold">— AVX tiers</p>
          <h2
            className="font-display mt-3.5 text-white"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            Six tiers. One Vault
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.65] text-white/60">
            <Sentences text="Your progress looks at the last 12 rolling months — completed stays only. Both thresholds must be met to level up." />
          </p>
        </Reveal>

        <Reveal direction="up">
          <div className="overflow-x-auto rounded-[20px] border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="px-5 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-white/50 md:px-7">
                    Tier
                  </th>
                  <th className="px-5 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-white/50 md:px-7">
                    Progress (last 12 months)
                  </th>
                  <th className="px-5 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-white/50 md:px-7">
                    You earn
                  </th>
                  <th className="px-5 py-5 text-xs font-semibold uppercase tracking-[0.08em] text-white/50 md:px-7">
                    Your AVX unlock
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr
                    key={tier.name}
                    className={cn(
                      'border-b border-white/[0.06] align-top last:border-b-0',
                      tier.hero && 'bg-gold/[0.08]',
                    )}
                  >
                    <td className="px-5 py-5 md:px-7">
                      <span
                        className={cn(
                          'font-display text-lg',
                          tier.hero ? 'text-gold' : 'text-white',
                        )}
                      >
                        {tier.name}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-sm text-white/70 md:px-7">
                      {tier.progress}
                    </td>
                    <td className="px-5 py-5 md:px-7">
                      <strong className="font-bold text-gold">{tier.earn}</strong>
                    </td>
                    <td className="px-5 py-5 text-sm leading-[1.6] text-white/70 md:px-7">
                      <Sentences text={tier.unlock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal direction="up" className="mt-8">
          <ul className="mx-auto max-w-[720px] space-y-2.5">
            {footnotes.map((note) => (
              <li
                key={note}
                className="flex gap-2.5 text-xs leading-[1.6] text-white/40 md:text-[13px]"
              >
                <span aria-hidden className="mt-[3px] flex-none text-white/25">
                  —
                </span>
                <span>
                  <Sentences text={note} />
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 flex justify-center">
          <Link
            href="/login"
            className="cta-pulse inline-flex items-center gap-2 rounded-full bg-gold px-9 py-[18px] text-[15px] font-bold text-ink transition duration-300 hover:translate-x-1 hover:bg-gold-pale"
          >
            Start earning →
          </Link>
        </div>
      </div>
    </section>
  );
}
