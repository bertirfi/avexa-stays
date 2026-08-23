'use client';

import { motion, useReducedMotion } from 'motion/react';

export interface AvexianMeterNext {
  tierName: string;
  staysNeeded: number;
  nightsNeeded: number;
  staysTarget: number;
  nightsTarget: number;
}

interface AvexianMeterProps {
  tierName: string;
  /** Completed stays in the rolling 12 months (back-to-back merged). */
  stays: number;
  nights: number;
  /** Next rung, or null at Diamond Hero. */
  next: AvexianMeterNext | null;
}

function untilLabel(next: AvexianMeterNext): string {
  const parts: string[] = [];
  if (next.staysNeeded > 0) {
    parts.push(`${next.staysNeeded} ${next.staysNeeded === 1 ? 'stay' : 'stays'}`);
  }
  if (next.nightsNeeded > 0) {
    parts.push(`${next.nightsNeeded} ${next.nightsNeeded === 1 ? 'night' : 'nights'}`);
  }
  // Both zero can't happen (the tier would already be reached) — guard anyway.
  if (parts.length === 0) return `${next.tierName} unlocks on your next completed stay`;
  return `${parts.join(' & ')} until ${next.tierName.toUpperCase()}`;
}

/**
 * The AVEXIAN Meter — tier badge + dual progress bars (stays & nights)
 * toward the next tier (M2.5.2). Client component only for the bar fill
 * animation; honors prefers-reduced-motion.
 */
export function AvexianMeter({ tierName, stays, nights, next }: AvexianMeterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-white/10 bg-white/5 px-8 py-9">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono-label text-white/40">AVEXIAN Meter</p>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          {tierName}
        </span>
      </div>

      {next ? (
        <>
          <p className="font-display mt-5 text-2xl leading-tight text-white">
            {untilLabel(next)}
          </p>
          <div className="mt-6 space-y-5">
            <MeterBar
              label="Stays"
              value={stays}
              target={next.staysTarget}
              reduceMotion={reduceMotion ?? false}
            />
            {next.nightsTarget > 0 && (
              <MeterBar
                label="Nights"
                value={nights}
                target={next.nightsTarget}
                reduceMotion={reduceMotion ?? false}
                delay={0.15}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <p className="font-display mt-5 text-2xl leading-tight text-white">
            You&apos;ve reached the summit
            <span
              aria-hidden
              className="ml-[0.12em] inline-block size-[0.18em] translate-y-[-0.05em] rounded-full bg-gold-dark align-baseline pulse-dot"
            />
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Diamond Hero — every experience in the Vault is yours, on the house.
          </p>
        </>
      )}

      <p className="mt-auto pt-6 text-xs text-white/35">
        {stays} {stays === 1 ? 'stay' : 'stays'} · {nights}{' '}
        {nights === 1 ? 'night' : 'nights'} in the last 12 months
      </p>
    </div>
  );
}

function MeterBar({
  label,
  value,
  target,
  reduceMotion,
  delay = 0,
}: {
  label: string;
  value: number;
  target: number;
  reduceMotion: boolean;
  delay?: number;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="font-mono-label text-white/40">{label}</span>
        <span className="font-semibold tabular-nums text-white/70">
          {value} <span className="text-white/35">/ {target}</span>
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(value, target)}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
          initial={reduceMotion ? false : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }
          }
          style={reduceMotion ? { width: `${pct}%` } : undefined}
        />
      </div>
    </div>
  );
}
