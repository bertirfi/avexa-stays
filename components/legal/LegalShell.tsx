import Link from 'next/link';
import type { ReactNode } from 'react';

interface LegalShellProps {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}

/** Shared chrome + scoped typography for legal pages. No global CSS. */
export function LegalShell({ title, updated, intro, children }: LegalShellProps) {
  return (
    <div className="bg-cream pt-28 pb-24 md:pt-36">
      <div className="mx-auto max-w-[760px] px-6 md:px-10">
        <nav className="font-mono-label mb-5 text-ink-60">
          <Link href="/" className="hover:text-gold-dark">
            Home
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <span className="text-ink">{title}</span>
        </nav>

        <h1 className="font-display text-3xl tracking-[-0.02em] md:text-[40px] md:leading-[1.05]">
          {title}
        </h1>
        <p className="font-mono-label mt-4 text-ink-60">Last updated · {updated}</p>
        {intro && <p className="mt-5 text-[17px] leading-relaxed text-ink-80">{intro}</p>}

        <div
          className="mt-10 text-[15.5px] text-ink-80 [&_a]:text-gold-dark [&_a]:underline [&_a]:underline-offset-2 [&_h2]:font-display [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:tracking-[-0.01em] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mb-1.5 [&_p]:mb-4 [&_p]:leading-[1.7] [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
