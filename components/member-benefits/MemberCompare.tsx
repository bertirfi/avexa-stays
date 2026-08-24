import { Reveal } from '@/components/Reveal';

interface Row {
  feature: string;
  guest: string;
  member: string;
}

const rows: Row[] = [
  { feature: 'Price', guest: 'Standard price', member: 'Same price + AVX Coins back on every stay' },
  {
    feature: 'Cancellation',
    guest: 'Non-refundable',
    member: 'Flexible: 100% refund ≥72h before check-in · 50% between 72h and 24h',
  },
  { feature: 'AVX Coins', guest: '—', member: '5%–15% of every stay, 1 AVX = 1 RON' },
  { feature: 'Upsells', guest: 'Pay full price', member: 'Pay with AVX Coins at every tier — 1 AVX = 1 RON' },
  {
    feature: 'Pay the stay with AVX',
    guest: '—',
    member: 'PLATINUM & DIAMOND HERO exclusive — 2 AVX = 1 RON',
  },
  { feature: 'Cost to join', guest: '—', member: 'Free, forever' },
];

const cols = 'grid grid-cols-[1fr_0.8fr_1.6fr] md:grid-cols-[1fr_0.8fr_1.6fr]';

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
            Guest vs
            <span aria-hidden className="text-white/25">
              .
            </span>{' '}
            Member
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
              <div className="font-display px-3 py-5 text-center text-base text-white/50 md:px-7">
                Guest
              </div>
              <div className="font-display px-3 py-5 text-center text-base text-gold md:px-7">
                AVEXIAN Member
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
                <div className="px-3 py-3.5 text-center text-xs text-white/45 md:px-7 md:py-[18px] md:text-sm">
                  {row.guest}
                </div>
                <div className="px-3 py-3.5 text-left text-xs leading-[1.5] text-white md:px-7 md:py-[18px] md:text-sm">
                  <strong className="font-bold text-gold">{row.member}</strong>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
