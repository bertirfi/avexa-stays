import Image from 'next/image';
import { Reveal } from '@/components/Reveal';
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
    icon: '%',
    title: '15% off every booking',
    desc: 'The member rate is automatic — applied the moment you sign in. No promo codes, no flash sales to hunt. Just the best price, every single time you book.',
    tag: 'Applied automatically',
    featured: true,
    photo: { src: '/listing-photos/30-living-room.jpeg', alt: 'Elegant Bucharest apartment building' },
  },
  {
    icon: '7+',
    title: '25% off stays of 7+ nights',
    desc: 'Planning a longer visit? Stays of a week or more unlock an even deeper discount — stacked on top of your member rate.',
    tag: 'Stacks with member rate',
  },
  {
    icon: '✕',
    title: 'Free cancellation',
    desc: 'Cancel right up to the day of arrival at no cost. Plans change — your booking should change with them, no questions asked.',
    tag: 'Until arrival day',
  },
  {
    icon: '2P',
    title: 'Early check-in from 2 PM',
    desc: 'Standard check-in is 3 PM. As a member, you can walk in an hour early — subject to same-day availability.',
    tag: 'Subject to availability',
  },
  {
    icon: '1P',
    title: 'Late check-out until 1 PM',
    desc: 'No rush on departure day. Stay a little longer, pack at your pace, have one more coffee before heading out.',
    tag: 'Automatic for members',
  },
  {
    icon: '♢',
    title: 'Welcome drinks & snacks',
    desc: 'Premium drinks and snacks waiting at the door. Every arrival. No request needed.',
    tag: 'Every stay',
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
        {perk.desc}
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
