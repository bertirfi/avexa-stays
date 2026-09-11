import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqCategoriesV3_2, faqJsonLdV3_2, renderFaqLine } from '@/content/legal/faq-v3-2';

export const metadata: Metadata = {
  title: 'Guest FAQ — v3.2',
  description: 'The questions we are actually asked — online check-in, payments, cleaning, extras and more at AVEXA Stays.',
  robots: { index: false },
};

export default function FaqVersionedPage() {
  return (
    <div className="bg-cream pt-28 pb-28 md:pt-36 md:pb-36">
      <JsonLd data={faqJsonLdV3_2} />
      <div className="mx-auto max-w-[820px] px-6 md:px-10">
        <nav className="font-mono-label mb-5 text-ink-60">
          <Link href="/" className="hover:text-gold-dark">
            Home
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <span className="text-ink">FAQ</span>
        </nav>

        <h1 className="font-display text-3xl tracking-[-0.02em] md:text-[44px] md:leading-[1.05]">
          Frequently asked questions
        </h1>
        <p className="font-mono-label mt-4 text-ink-60">Document AVX-09 · Version 3.2 · In force from 1 September 2026</p>

        <div className="mt-16 space-y-20 md:mt-20 md:space-y-24">
          {faqCategoriesV3_2.map((category) => (
            <section key={category.title}>
              <h2 className="font-mono-label mb-4 text-gold-dark">
                {category.title}
              </h2>
              <div className="flex flex-col">
                {category.items.map((item) => (
                  <details key={item.q} className="group border-b border-gray-line [&:first-child]:border-t">
                    <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-lg leading-[1.3] [&::-webkit-details-marker]:hidden group-open:text-gold-dark">
                      <span className="tracking-[-0.01em]">{item.q}</span>
                    </summary>
                    <div className="max-w-[620px] space-y-3 pt-1 pb-7">
                      {item.a.map((line) => (
                        <p key={line} className="text-[15px] leading-[1.7] text-ink-80">
                          {renderFaqLine(line)}
                        </p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
