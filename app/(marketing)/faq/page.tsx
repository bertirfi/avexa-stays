import type { Metadata } from 'next';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqs as memberFaqs, type QA } from '@/components/member-benefits/MemberFAQ';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about booking, digital check-in, payment, cancellation, and AVEXA membership in Bucharest.',
  alternates: { canonical: '/faq' },
};

// Factual, site-grounded answers (digital check-in, payment, taxes, locations).
const generalFaqs: QA[] = [
  {
    q: 'How do I check in?',
    a: 'Every AVEXA stay is fully digital. You verify your ID in advance and receive a unique access code 24 hours before arrival, then let yourself in — no front desk, no key handover, no waiting.',
  },
  {
    q: 'Is there a reception or front desk?',
    a: 'No. AVEXA is built around self check-in and digital access, so you arrive and leave entirely on your own schedule.',
  },
  {
    q: 'Where are the apartments located?',
    a: 'Every AVEXA apartment sits in the heart of Bucharest city center — across Calea Victoriei, the Old City Center, Universitate, and Piața Romană.',
  },
  {
    q: 'What payment methods can I use?',
    a: 'We accept major debit and credit cards and common digital wallets, processed securely at the time of booking.',
  },
  {
    q: 'Are taxes included in the price?',
    a: 'Yes. Prices are shown in euro and include applicable taxes, such as the local city tax, unless stated otherwise.',
  },
  {
    q: 'Can I book a longer stay?',
    a: 'Many apartments welcome long-term stays, and members save 25% on stays of seven nights or more.',
  },
];

const groups: { title: string; items: QA[] }[] = [
  { title: 'Booking & your stay', items: generalFaqs },
  { title: 'Membership & rates', items: memberFaqs },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...generalFaqs, ...memberFaqs].map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="bg-cream pt-28 pb-24 md:pt-36">
      <JsonLd data={faqSchema} />
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
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-ink-80">
          Everything you need to know about booking, checking in, and getting the
          best rate. Cannot find your answer? Email{' '}
          <a
            href="mailto:hello@avexastays.com"
            className="font-semibold text-gold-dark underline underline-offset-2"
          >
            hello@avexastays.com
          </a>
          .
        </p>

        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="font-mono-label mb-2 text-gold-dark">{group.title}</h2>
              <div className="flex flex-col">
                {group.items.map((item, i) => (
                  <Reveal key={item.q} direction="up" delay={i * 0.05}>
                    <details className="group border-b border-gray-line [&:first-child]:border-t">
                      <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-lg leading-[1.3] transition-colors duration-200 [&::-webkit-details-marker]:hidden group-open:text-gold-dark group-hover:text-gold-dark">
                        <span style={{ letterSpacing: '-0.01em' }}>{item.q}</span>
                        <span
                          aria-hidden
                          className="flex-none font-mono text-[22px] font-normal leading-none text-ink-60 transition-colors duration-200 group-open:text-gold-dark"
                        >
                          <span className="group-open:hidden">+</span>
                          <span className="hidden group-open:inline">−</span>
                        </span>
                      </summary>
                      <div className="pb-6">
                        <p className="max-w-[640px] text-[15px] leading-[1.7] text-ink-80">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
