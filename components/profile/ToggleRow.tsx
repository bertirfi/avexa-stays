'use client';

import { cn } from '@/lib/cn';

interface Props {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  first?: boolean;
  last?: boolean;
}

export function ToggleRow({ label, description, checked, onChange, first, last }: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-5 border-b border-gray-line py-[18px]',
        first && 'pt-0',
        last && 'border-b-0 pb-0',
      )}
    >
      <div>
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-[13px] text-ink-60">{description}</span>
      </div>
      <label className="relative inline-block h-6 w-11 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'absolute inset-0 cursor-pointer rounded-full bg-gray-line transition-colors duration-[250ms] peer-checked:bg-ink',
            'before:absolute before:bottom-[3px] before:left-[3px] before:size-[18px] before:rounded-full before:bg-white before:shadow-[0_1px_3px_rgba(0,0,0,0.15)] before:transition-transform before:duration-[250ms] before:content-[""]',
            'peer-checked:before:translate-x-5',
          )}
        />
      </label>
    </div>
  );
}
