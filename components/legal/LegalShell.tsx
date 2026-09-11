import Link from 'next/link';
import type { ReactNode } from 'react';
import { Sentences } from '@/components/shared/Sentences';

interface LegalShellProps {
  title: string;
  /** @deprecated pass `code`/`version`/`inForce` instead — kept while AVX-06/07/08/09 migrate. */
  updated?: string;
  code?: string;
  version?: string;
  inForce?: string;
  intro?: string;
  children: ReactNode;
}

/** Shared chrome + scoped typography for legal pages. No global CSS. */
export function LegalShell({
  title,
  updated,
  code,
  version,
  inForce,
  intro,
  children,
}: LegalShellProps) {
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
        {code && version && inForce ? (
          <p className="font-mono-label mt-4 text-ink-60">
            Document {code} · Version {version} · In force from {inForce}
          </p>
        ) : (
          updated && <p className="font-mono-label mt-4 text-ink-60">Last updated · {updated}</p>
        )}
        {intro && (
          <p className="mt-5 text-[17px] leading-relaxed text-ink-80">
            <Sentences text={intro} />
          </p>
        )}

        <div
          className="mt-10 text-[15.5px] text-ink-80 [&_a]:text-gold-dark [&_a]:underline [&_a]:underline-offset-2 [&_h2]:font-display [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:tracking-[-0.01em] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mb-1.5 [&_p]:mb-4 [&_p]:leading-[1.7] [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_th]:border [&_th]:border-gray-line [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-ink [&_td]:border [&_td]:border-gray-line [&_td]:px-3 [&_td]:py-2"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
