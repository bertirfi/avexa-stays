import { Reveal } from '@/components/Reveal';

interface Row {
  feature: string;
  guest: string;
  member: string;
}

const rows: Row[] = [
  { feature: 'Best available rate', guest: 'Standard price', member: '15% off' },
  { feature: '7+ night discount', guest: '—', member: '25% off' },
  { feature: 'Cancellation', guest: '48h notice', member: 'Free until arrival' },
  { feature: 'Check-in', guest: '3:00 PM', member: '2:00 PM' },
  { feature: 'Check-out', guest: '11:00 AM', member: '1:00 PM' },
  { feature: 'Welcome package', guest: '—', member: 'Drinks & snacks' },
  { feature: 'Cost', guest: '—', member: 'Free, forever' },
];

const cols = 'grid grid-cols-[1.2fr_0.8fr_1fr] md:grid-cols-3';

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
                Member
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
                <div className="px-3 py-3.5 text-center text-xs text-white md:px-7 md:py-[18px] md:text-sm">
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
