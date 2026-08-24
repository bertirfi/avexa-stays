import { Reveal } from '@/components/Reveal';
import { Sentences } from '@/components/shared/Sentences';

export interface QA {
  q: string;
  a: string;
}

export const faqs: QA[] = [
  {
    q: 'What are AVEXA Coins (AVX)?',
    a: 'Our loyalty currency: 1 AVX = 1 RON. You earn a percentage of the net accommodation value of every completed stay — from 5% as BRONZE up to 15% as DIAMOND HERO — and spend them on your unlocked upsells at any earning tier. PLATINUM and DIAMOND HERO members exclusively can also pay for the stay itself — 2 AVX = 1 RON.',
  },
  {
    q: 'When can I use my coins?',
    a: 'Coins become active 24 hours after check-out and stay valid for 12 months. Spend them on your unlocked upsells at every tier — 1 AVX = 1 RON. PLATINUM and DIAMOND HERO members can spend them on anything, including the stay itself at 2 AVX = 1 RON.',
  },
  {
    q: 'How do I level up?',
    a: 'Tiers look at your last 12 months and both conditions must be met: number of completed stays AND nights. Example: GOLD needs 3 stays and 10 nights.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Members enjoy flexible cancellation: 100% refund when cancelling at least 72 hours before check-in, 50% between 72 and 24 hours. Non-member bookings are non-refundable. City tax is always refunded in full.',
  },
  {
    q: 'Is early check-in or late check-out included?',
    a: 'They are bookable upsells, subject to availability — pay with money or, once your tier unlocks them (SILVER and up), with your AVX Coins at 1 AVX = 1 RON.',
  },
  {
    q: 'How much does membership cost?',
    a: 'Nothing. Free to join, free forever.',
  },
];

export function MemberFAQ() {
  return (
    <section className="bg-white py-[clamp(90px,11vw,150px)]">
      <div className="mx-auto max-w-[860px] px-4 md:px-10">
        <Reveal direction="up" className="mb-14">
          <p className="font-mono-label text-gold-dark">— Questions</p>
          <h2
            className="font-display mt-3.5"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            Frequently asked
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
            />
          </h2>
        </Reveal>

        <div className="flex flex-col">
          {faqs.map((item, i) => (
            <Reveal key={item.q} direction="up" delay={i * 0.12}>
              <details className="group border-b border-gray-line [&:first-child]:border-t [&:first-child]:border-gray-line">
                <summary className="font-display flex cursor-pointer list-none items-center justify-between py-7 text-lg leading-[1.3] transition-colors duration-200 [&::-webkit-details-marker]:hidden group-open:text-gold-dark group-hover:text-gold-dark">
                  <span style={{ letterSpacing: '-0.01em' }}>{item.q}</span>
                  <span
                    aria-hidden
                    className="ml-5 flex-none font-mono text-[22px] font-normal leading-none text-ink-60 transition-colors duration-200 group-open:text-gold-dark"
                  >
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <div className="pb-7">
                  <p className="max-w-[640px] text-[15px] leading-[1.7] text-ink-80">
                    <Sentences text={item.a} />
                  </p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
