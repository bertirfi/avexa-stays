import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';

interface Step {
  label: string;
  active: boolean;
  bonus?: string;
}

const steps: Step[] = [
  { label: 'Trip 1', active: true },
  { label: 'Trip 2', active: true },
  { label: 'Trip 3', active: false, bonus: '+10% off' },
];

export function MemberReward() {
  return (
    <section className="bg-ink py-[clamp(80px,10vw,140px)] text-white">
      <Reveal direction="up" className="mx-auto max-w-[800px] px-6 text-center md:px-10">
        <div className="mb-6">
          <p className="font-mono-label text-gold">— Loyalty reward</p>
          <h2
            className="font-display mt-3.5 text-white"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            3 trips. 10% more off
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </h2>
        </div>

        <p className="mx-auto mb-12 max-w-[540px] text-[17px] leading-[1.65] text-white/60">
          After your third AVEXA stay, unlock a 10% bonus discount — stacked on top of your member rate and long-stay savings.
        </p>

        <div className="mb-10 flex items-center justify-center">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className="-mt-9 h-0.5 w-12 bg-white/[0.12] sm:w-20"
                />
              )}
              <div className="relative flex flex-col items-center gap-3">
                {step.bonus && (
                  <span className="font-display absolute -top-[30px] whitespace-nowrap rounded-full bg-gold px-3.5 py-[5px] text-xs text-ink">
                    {step.bonus}
                  </span>
                )}
                <span
                  className={cn(
                    'grid size-14 place-items-center rounded-full border-2',
                    step.active
                      ? 'border-gold bg-[rgba(221,185,122,0.12)]'
                      : 'border-white/15',
                  )}
                >
                  <span
                    className={cn(
                      'size-3.5 rounded-full',
                      step.active ? 'bg-gold pulse-dot' : 'bg-white/20',
                    )}
                  />
                </span>
                <span className="font-mono-label text-xs tracking-[0.12em] text-white/45">
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="cta-pulse inline-flex items-center gap-2 rounded-full bg-gold px-9 py-[18px] text-[15px] font-bold text-ink transition duration-300 hover:translate-x-1 hover:bg-gold-pale"
        >
          Start saving →
        </Link>
      </Reveal>
    </section>
  );
}
