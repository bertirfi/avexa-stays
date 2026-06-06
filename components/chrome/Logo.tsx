import { cn } from '@/lib/cn';

interface LogoProps {
  size?: number;
  wordmarkSize?: number;
  className?: string;
  showWordmark?: boolean;
  /** Wordmark color: 'gold' (default) or 'gold-dark' (for pinned/white nav) */
  tone?: 'gold' | 'gold-dark';
}

/**
 * AVEXA brand mark — geometric X (white + gray strokes) with a separate,
 * centered, pulsing gold dot overlaid on the crossing point — matching
 * app-v2.html / locations.html (.logo-mark .dot).
 */
export function Logo({
  size = 56,
  wordmarkSize = 28,
  className,
  showWordmark = true,
  tone = 'gold',
}: LogoProps) {
  const dot = Math.max(6, Math.round(size * 0.135));
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden
        className="relative grid place-items-center rounded-[26%] border border-white/12 bg-[#474747]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 20 20" width={size * 0.52} height={size * 0.52}>
          <line x1="3" y1="3" x2="17" y2="17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Separate centered pulsing dot */}
        <span
          className="pulse-dot absolute inset-0 m-auto rounded-full bg-gold"
          style={{ width: dot, height: dot }}
        />
      </span>
      {showWordmark && (
        <span
          className={cn('font-display', tone === 'gold' ? 'text-gold' : 'text-gold-dark')}
          style={{ fontSize: wordmarkSize, letterSpacing: '-0.005em', lineHeight: 0.9 }}
        >
          AVEXA
        </span>
      )}
    </div>
  );
}
