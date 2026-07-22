import { Reveal } from '@/components/Reveal';

export interface QA {
  q: string;
  a: string;
}

export const faqs: QA[] = [
  {
    q: 'Is membership really free?',
    a: 'Yes — completely free, with no hidden fees, no trials, and no expiry date. You sign up once and keep your benefits forever.',
  },
  {
    q: 'How is the 15% discount applied?',
    a: "The member rate appears automatically once you're signed in. No promo codes needed — every listing shows your discounted price by default.",
  },
  {
    q: 'Can I cancel a booking for free?',
    a: 'Members can cancel at no cost right up to the day of arrival. If you cancel on the arrival date itself, a one-night charge applies.',
  },
  {
    q: 'Does the 7+ night discount stack with the member rate?',
    a: "It does. For stays of seven nights or more, the 25% long-stay discount is applied on top of your 15% member rate — so you're saving even more.",
  },
  {
    q: 'Is early check-in guaranteed?',
    a: "Early check-in from 2 PM is available subject to same-day availability. In most cases it's confirmed — we'll let you know by noon on the day.",
  },
  {
    q: "What's included in the welcome package?",
    a: 'A selection of drinks and snacks sourced from local producers — waiting at the door when you arrive. The selection changes by season and location.',
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
                    {item.a}
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
