import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
import { Sentences } from '@/components/shared/Sentences';
import { cn } from '@/lib/cn';

interface Perk {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  featured?: boolean;
  photo?: { src: string; alt: string };
}

const perks: Perk[] = [
  {
    icon: 'AVX',
    title: 'Earn 5%–15% AVX on every stay',
    desc: 'Every completed stay earns AVEXA Coins — from 5% as BRONZE up to 15% as DIAMOND HERO, calculated on the net accommodation value. 1 AVX = 1 RON — simple and transparent.',
    tag: 'Earned automatically',
    featured: true,
    photo: { src: '/listing-photos/30-living-room.jpeg', alt: 'Elegant Bucharest apartment building' },
  },
  {
    icon: '%',
    title: 'Flexible cancellation for members',
    desc: 'Plans change. Cancel 72 hours or more before check-in for a full refund, or up to 24 hours before for half back — a right non-members don’t have.',
    tag: '100% refund ≥72h · 50% between 72h–24h',
  },
  {
    icon: '24h',
    title: 'Coins land 24h after check-out',
    desc: 'Your AVX activate a day after you check out and stay valid for 12 months — plenty of time to plan your next Bucharest stay.',
    tag: 'Valid for 12 months',
  },
  {
    icon: '→',
    title: 'Spend AVX on future stays',
    desc: 'Put your coins toward the next booking — 1 AVX = 1 RON, from your very first tier.',
    tag: 'Every tier',
  },
  {
    icon: '♢',
    title: 'PLATINUM+: pay your stay with coins',
    desc: 'From PLATINUM, AVX pays for anything — early check-in, late check-out, transfers & every upsell.',
    tag: 'PLATINUM & DIAMOND HERO',
  },
  {
    icon: '∞',
    title: 'Free to join. Free forever.',
    desc: 'No membership fee, no hidden cost, no catch. Every AVEXIAN Traveller earns and spends AVX starting with their very first stay.',
    tag: 'No cost, ever',
    featured: true,
    photo: { src: '/listing-photos/37-restaurant.jpeg', alt: 'Sunny neighborhood café terrace' },
  },
];

export function MemberPerks() {
  return (
    <section id="benefits" className="bg-white py-[clamp(90px,11vw,150px)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-10">
        <Reveal direction="up" className="mb-16">
          <p className="font-mono-label text-gold-dark">— 06 Member perks</p>
          <h2
            className="font-display mt-3.5"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            Your membership. In full
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
            />
          </h2>
        </Reveal>

        <div className="flex flex-col gap-4">
          {perks.map((p, i) => (
            <Reveal key={p.title} direction="up" delay={i * 0.12}>
              <PerkCard perk={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerkCard({ perk }: { perk: Perk }) {
  if (perk.featured) {
    return (
      <article className="group grid grid-cols-1 items-center gap-5 overflow-hidden rounded-[20px] border border-ink bg-ink text-white transition duration-[400ms] ease-[var(--ease-snap)] hover:border-gold hover:shadow-[0_20px_48px_-20px_rgba(25,25,25,.35)] md:grid-cols-[64px_1fr_minmax(180px,260px)] md:gap-5 lg:grid-cols-[72px_1fr_minmax(200px,300px)] lg:gap-7 lg:pr-0">
        <div className="px-5 pt-6 md:pl-7 md:pr-0 md:py-9 lg:pl-10">
          <PerkIcon glyph={perk.icon} featured />
        </div>
        <div className="px-5 md:px-0 md:py-9">
          <PerkText perk={perk} featured />
        </div>
        {perk.photo && (
          <div className="relative mx-0 -mb-px mt-1 min-h-[180px] self-stretch overflow-hidden md:my-0 md:min-h-[200px]">
            <Image
              src={perk.photo.src}
              alt={perk.photo.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 100vw"
              className="object-cover"
            />
            {/* Gradient blend — horizontal on desktop, vertical on mobile */}
            <div
              aria-hidden
              className="absolute inset-0 [background:linear-gradient(0deg,_rgba(25,25,25,0)_60%,_rgba(25,25,25,.25)_100%)] md:[background:linear-gradient(90deg,_var(--color-ink)_0%,_rgba(25,25,25,.35)_22%,_rgba(25,25,25,0)_55%)]"
            />
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="group grid grid-cols-1 items-start gap-4 rounded-[20px] border border-gray-line bg-cream p-6 transition duration-[400ms] ease-[var(--ease-snap)] hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_48px_-20px_rgba(25,25,25,.12)] md:grid-cols-[64px_1fr] md:gap-5 md:px-7 md:py-7 lg:grid-cols-[80px_1fr] lg:gap-7 lg:px-10 lg:py-9">
      <PerkIcon glyph={perk.icon} />
      <PerkText perk={perk} />
    </article>
  );
}

function PerkIcon({ glyph, featured }: { glyph: string; featured?: boolean }) {
  return (
    <span
      className={cn(
        'grid size-14 flex-none place-items-center rounded-[14px] font-mono-label text-[15px] normal-case tracking-normal md:size-16 md:rounded-[18px] md:text-[18px] lg:size-[72px]',
        featured ? 'bg-white/[0.08] text-gold' : 'bg-ink/[0.06] text-gold-dark',
      )}
      aria-hidden
    >
      {glyph}
    </span>
  );
}

function PerkText({ perk, featured }: { perk: Perk; featured?: boolean }) {
  return (
    <div>
      <h3
        className="font-display text-2xl"
        style={{ letterSpacing: '-0.01em', lineHeight: 1.15 }}
      >
        {perk.title}
      </h3>
      <p
        className={cn(
          'mt-2.5 max-w-[560px] text-[15px] leading-[1.7]',
          featured ? 'text-white/60' : 'text-ink-80',
        )}
      >
        <Sentences text={perk.desc} />
      </p>
      <span
        className={cn(
          'font-mono-label mt-[18px] inline-flex items-center gap-2.5 text-[10.5px] before:h-px before:w-5 before:content-[""]',
          featured
            ? 'text-white/40 before:bg-white/25'
            : 'text-ink-60 before:bg-ink-60',
        )}
      >
        {perk.tag}
      </span>
    </div>
  );
}
