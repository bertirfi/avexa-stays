import { TIERS, tierRank, type TierId } from '@/lib/avx/tiers';
import { Sentences } from '@/components/shared/Sentences';

/**
 * The Vault (M2.5.3) — every AVEXIAN experience, grouped by the tier that
 * introduces it. Items above the member's tier are locked (greyed + lock +
 * "Reach {TIER} to unlock this experience"). AVX pays for unlocked upsells at
 * every earning tier (1 AVX = 1 RON); PLATINUM & DIAMOND exclusively can also
 * pay for the stay itself (2 AVX = 1 RON) — client decision 24.08.
 */
export function VaultGrid({ userTier }: { userTier: TierId }) {
  const userRank = tierRank(userTier);
  const groups = TIERS.filter((t) => t.vaultItems.length > 0);

  return (
    <div>
      <p className="font-mono-label text-white/40">— The Vault</p>
      <div className="mt-5 space-y-8">
        {groups.map((tier) => {
          const locked = tierRank(tier.id) > userRank;
          return (
            <div key={tier.id}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    locked
                      ? 'border-white/15 text-white/40'
                      : 'border-gold/40 bg-gold/10 text-gold'
                  }`}
                >
                  {tier.name}
                </span>
                {!locked && (
                  <span className="font-mono-label text-white/30">Unlocked</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tier.vaultItems.map((item) => (
                  <VaultTile key={item} label={item} tierName={tier.name} locked={locked} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 max-w-[640px] text-xs leading-relaxed text-white/35">
        <Sentences text="AVX Coins pay for your unlocked upsells at every tier — 1 AVX = 1 RON. PLATINUM and DIAMOND HERO exclusively can also pay for the stay itself — 2 AVX = 1 RON. AVX Coins are non-transferable and hold no cash value." />
      </p>
    </div>
  );
}

function VaultTile({
  label,
  tierName,
  locked,
}: {
  label: string;
  tierName: string;
  locked: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-[14px] border px-5 py-5 ${
        locked
          ? 'border-white/[0.07] bg-white/[0.02]'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`font-display text-lg leading-tight ${
            locked ? 'text-white/30' : 'text-white'
          }`}
        >
          {label}
        </span>
        {locked && <LockGlyph />}
      </div>
      {locked && (
        <span className="text-xs text-white/30">
          Reach {tierName} to unlock this experience
        </span>
      )}
    </div>
  );
}

function LockGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-white/25"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
