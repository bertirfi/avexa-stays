import { Reveal } from '@/components/Reveal';

interface Row {
  feature: string;
  member: string;
  nonMember: string;
}

// Member column FIRST, non-member second (client 04.09) — the page sells
// membership, so the strong column leads.
const rows: Row[] = [
  { feature: 'Price', member: 'Same price + AVX Coins back on every stay', nonMember: 'Standard price' },
  {
    feature: 'Cancellation',
    member: 'Flexible: 100% refund ≥72h before check-in · 50% between 72h and 24h — a benefit only members have',
    nonMember: 'Non-refundable',
  },
  { feature: 'AVX Coins', member: '5%–15% of every stay, 1 AVX = 1 RON', nonMember: '—' },
  { feature: 'Upsells', member: 'Pay with AVX Coins at every tier — 1 AVX = 1 RON', nonMember: 'Pay full price' },
  {
    feature: 'Pay the stay with AVX',
    member: 'PLATINUM & DIAMOND HERO exclusive — 2 AVX = 1 RON',
    nonMember: '—',
  },
  { feature: 'Cost to join', member: 'Free, forever', nonMember: '—' },
];

const cols = 'grid grid-cols-[1fr_1.6fr_0.8fr] md:grid-cols-[1fr_1.6fr_0.8fr]';

export function MemberCompare() {
  return (
    <section className="bg-ink py-[clamp(90px,11vw,150px)] text-white">
      <div className="mx-auto max-w-[900px] px-4 md:px-10">
        <Reveal direction="up" className="mb-14">
          <p className="font-mono-label text-gold">— Side by side</p>
          <h2
            className="font-display mt-3.5 text-white"
            style={{ fontSize: 'clamp(44px,6.2vw,80px)', lineHeight: 1 }}
          >
            Member vs. Non-member
            <span
              aria-hidden
              className="ml-[0.08em] inline-block size-[0.14em] translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
            />
          </h2>
        </Reveal>

        <Reveal direction="up">
          <div className="overflow-hidden rounded-[20px] border border-white/10">
            {/* Header */}
            <div className={`${cols} border-b border-white/10 bg-white/[0.04]`}>
              <div className="px-3 py-5 md:px-7" />
              <div className="font-display px-3 py-5 text-center text-base text-gold md:px-7">
                AVEXIAN Member
              </div>
              <div className="font-display px-3 py-5 text-center text-base text-white/50 md:px-7">
                Non-member
              </div>
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div
                key={row.feature}
                className={`${cols} border-b border-white/[0.06] last:border-b-0`}
              >
                <div className="px-4 py-3.5 text-xs font-medium text-white/70 md:px-7 md:py-[18px] md:text-sm">
                  {row.feature}
                </div>
                <div className="px-3 py-3.5 text-left text-xs leading-[1.5] text-white md:px-7 md:py-[18px] md:text-sm">
                  <strong className="font-bold text-gold">{row.member}</strong>
                </div>
                <div className="px-3 py-3.5 text-center text-xs text-white/55 md:px-7 md:py-[18px] md:text-sm">
                  {row.nonMember}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
