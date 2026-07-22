import { Reveal } from '@/components/Reveal';

export function MemberStatement() {
  return (
    <section className="bg-gold px-6 py-[clamp(90px,12vw,160px)] text-center text-ink md:px-10">
      <Reveal direction="up" className="mx-auto max-w-[800px]">
        <div
          className="font-display mb-2.5"
          style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15 }}
        >
          No tiers. No points.
        </div>
        <div
          className="font-display mb-2.5"
          style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15 }}
        >
          No catch. No expiry.
        </div>
        <div
          className="font-display relative mt-2 italic"
          style={{ fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.15 }}
        >
          Just the lowest rate, every time
          <span
            aria-hidden
            className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold-dark align-baseline pulse-dot"
          />
          <span
            aria-hidden
            className="mx-auto mt-6 block h-[3px] w-12 rounded-sm bg-ink"
          />
        </div>
      </Reveal>
    </section>
  );
}
