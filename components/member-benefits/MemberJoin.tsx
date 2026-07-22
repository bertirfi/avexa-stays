import { Reveal } from '@/components/Reveal';

interface Step {
  num: string;
  title: string;
  desc: string;
}

const steps: Step[] = [
  { num: '01', title: 'Enter your email', desc: "That's your login. No forms, no paperwork." },
  { num: '02', title: 'Create a password', desc: "Pick something strong. You're done." },
  { num: '03', title: 'Book at member rate', desc: 'Your discount applies from the first booking.' },
];

export function MemberJoin() {
  return (
    <section className="bg-gold py-[clamp(90px,11vw,150px)] text-ink">
      <div className="mx-auto max-w-[1100px] px-4 md:px-10">
        <Reveal direction="up" className="mb-16">
          <p className="font-mono-label">— 30 seconds</p>
          <h2
            className="font-display mt-3.5"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            Joining is instant
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </h2>
        </Reveal>

        <div className="flex flex-col items-center md:flex-row md:items-start">
          {steps.map((step, i) => [
            i > 0 && (
              <Reveal
                key={`${step.num}-line`}
                direction="up"
                delay={i * 0.12}
                className="flex flex-none justify-center md:block"
              >
                <span
                  aria-hidden
                  className="block h-px w-12 bg-ink/15 md:mt-5 md:h-20 md:w-px"
                />
              </Reveal>
            ),
            <Reveal
              key={step.num}
              direction="up"
              delay={i * 0.12}
              className="w-full flex-1 py-6 md:px-6 md:py-0"
            >
              <div className="text-center">
                <span
                  className="font-display block text-ink/[0.18]"
                  style={{ fontSize: 56, lineHeight: 0.85, letterSpacing: '-0.04em' }}
                >
                  {step.num}
                </span>
                <h3
                  className="font-display mt-5 text-[22px]"
                  style={{ letterSpacing: '-0.01em', lineHeight: 1.15 }}
                >
                  {step.title}
                </h3>
                <p className="mx-auto mt-2.5 max-w-[260px] text-[15px] leading-[1.65] text-ink-80">
                  {step.desc}
                </p>
              </div>
            </Reveal>,
          ])}
        </div>
      </div>
    </section>
  );
}
