import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface Props {
  title: string;
  /** Optional right-aligned summary detail (e.g. the review average). */
  meta?: ReactNode;
  /** Closed everywhere by default — the stay page scrolled too far (client feedback). */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One collapsible stay-page section. Native <details> on purpose: no client
 * state, so the section ships inside the static (ISR) HTML, works without JS,
 * and browser find-in-page / print can still reach the content.
 * The expand animation lives in globals.css (`.stay-section`).
 */
export function StaySection({ title, meta, defaultOpen = false, children }: Props) {
  return (
    <details open={defaultOpen} className="stay-section group border-b border-gray-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="flex shrink-0 items-center gap-3">
          {meta}
          <Icon
            name="chevDown"
            size={20}
            className="shrink-0 text-ink-60 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </span>
      </summary>
      <div className="pb-10">{children}</div>
    </details>
  );
}
