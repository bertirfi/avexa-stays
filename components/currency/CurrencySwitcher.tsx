'use client';

import { DISPLAY_CURRENCIES, type DisplayCurrency } from '@/lib/currency';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import { cn } from '@/lib/cn';

/**
 * Compact EUR / RON / USD selector. Display-only — switching never changes
 * what is charged (always RON). Two visual tones so it sits on both the dark
 * nav and light surfaces.
 */
export function CurrencySwitcher({
  tone = 'dark',
  className,
}: {
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">Display currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as DisplayCurrency)}
        className={cn(
          'appearance-none rounded-full border bg-transparent py-1.5 pl-3 pr-7',
          'font-mono-label cursor-pointer transition-colors focus:outline-none',
          tone === 'dark'
            ? 'border-white/20 text-cream hover:border-gold focus:border-gold [&>option]:bg-ink [&>option]:text-cream'
            : 'border-ink/20 text-ink hover:border-gold-dark focus:border-gold-dark',
        )}
      >
        {DISPLAY_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className={cn(
          'pointer-events-none absolute right-2.5 h-3 w-3',
          tone === 'dark' ? 'text-cream/60' : 'text-ink/60',
        )}
      >
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}
