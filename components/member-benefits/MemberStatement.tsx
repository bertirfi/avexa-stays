import { Reveal } from '@/components/Reveal';
import { Sentences } from '@/components/shared/Sentences';

export function MemberStatement() {
  return (
    <section className="bg-gold px-6 py-[clamp(90px,12vw,160px)] text-center text-ink md:px-10">
      <Reveal direction="up" className="mx-auto max-w-[800px]">
        <div
          className="font-display mb-2.5"
          style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15 }}
        >
          We don&apos;t do simple discounts.
        </div>
        <div
          className="font-display relative italic"
          style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15 }}
        >
          {/* No literal period here — the pulsing dot IS the full stop
              (client 04.09: one dot only, no rule underneath). */}
          We offer the best prices and MORE
          <span
            aria-hidden
            className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
          />
        </div>
        <p className="mx-auto mt-8 max-w-[620px] text-[16px] leading-[1.75] text-ink-80 md:text-[17px]">
          <Sentences text="Earn AVEXA Coins (AVX) with every stay and craft your perfect experience. From late check-outs to private airport transfers, your loyalty unlocks the exclusive AVEXIAN Vault. Use your coins to buy back your time and absolute comfort. 1 AVX = 1 RON — what you see is what you get." />
        </p>
      </Reveal>
    </section>
  );
}
