import { cn } from '@/lib/cn';

interface LogoProps {
  size?: number;
  wordmarkSize?: number;
  className?: string;
  showWordmark?: boolean;
}

/**
 * AVEXA brand mark — geometric X with gold center dot,
 * optionally followed by the AVEXA wordmark in Plus Jakarta Sans 800 gold.
 */
export function Logo({
  size = 56,
  wordmarkSize = 28,
  className,
  showWordmark = true,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        aria-hidden
        className="grid place-items-center rounded-2xl bg-[#474747] border border-white/12"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 20 20" width={size * 0.58} height={size * 0.58}>
          <line x1="3" y1="3" x2="17" y2="17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="3" x2="3" y2="17" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="10" r="2" fill="#DDB97A" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className="font-display text-gold"
          style={{ fontSize: wordmarkSize, letterSpacing: '-0.005em', lineHeight: 1 }}
        >
          AVEXA
        </span>
      )}
    </div>
  );
}
