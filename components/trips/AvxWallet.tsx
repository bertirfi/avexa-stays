import type { AvxWalletData } from '@/lib/avx/ledger';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Bucharest',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * AVX Wallet card — server component, rendered inside the dark AVEXIAN
 * Journey band. `wallet === null` means the feature is dark (migration not
 * run yet) → a calm "being prepared" state instead of a crash or a gap.
 */
export function AvxWallet({ wallet }: { wallet: AvxWalletData | null }) {
  if (wallet === null) {
    return (
      <div className="flex h-full flex-col justify-center rounded-[20px] border border-white/10 bg-white/5 px-8 py-9">
        <p className="font-mono-label text-white/40">AVX Wallet</p>
        <p className="font-display mt-3 text-2xl leading-tight text-white">
          Your AVEXIAN Wallet is being prepared
          <span
            aria-hidden
            className="ml-[0.12em] inline-block size-[0.18em] translate-y-[-0.05em] rounded-full bg-gold-dark align-baseline pulse-dot"
          />
        </p>
        <p className="mt-3 max-w-[360px] text-sm leading-relaxed text-white/55">
          AVX Coins land here soon — every completed stay will earn you coins
          to spend on experiences.
        </p>
      </div>
    );
  }

  const pendingTotal = wallet.pending.reduce((sum, t) => sum + t.amount, 0);
  const nextActivation = wallet.pending[0]?.at ?? null;
  const earliestExpiry = wallet.active[0]?.at ?? null;

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-gold/25 bg-gold/[0.06] px-8 py-9">
      <p className="font-mono-label text-gold">AVX Wallet</p>
      <p className="font-display mt-4 text-[clamp(40px,5vw,56px)] leading-none text-white">
        {wallet.balance.toLocaleString('en-US')}{' '}
        <span className="text-[0.5em] tracking-normal text-gold">AVX</span>
      </p>
      <p className="mt-2 text-sm text-white/55">
        = {wallet.balance.toLocaleString('en-US')} RON in experiences
      </p>

      <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
        {pendingTotal > 0 && nextActivation && (
          <p className="text-white/70">
            <span className="font-semibold text-gold">
              {pendingTotal.toLocaleString('en-US')} AVX
            </span>{' '}
            activate on {DATE_FORMAT.format(new Date(nextActivation))}
          </p>
        )}
        {earliestExpiry && (
          <p className="text-white/55">
            Earliest expiry: {DATE_FORMAT.format(new Date(earliestExpiry))}
          </p>
        )}
        {wallet.balance === 0 && pendingTotal === 0 && (
          <p className="text-white/55">Complete a stay to earn your first AVX.</p>
        )}
      </div>

      <p className="mt-auto pt-6 text-xs text-white/35">
        1 AVX = 1 RON. Non-transferable, no cash value.
      </p>
    </div>
  );
}
