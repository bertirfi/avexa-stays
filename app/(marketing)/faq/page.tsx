import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/contact';
import { CANCELLATION_POLICY } from '@/lib/policies';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about online check-in and PIN codes, check-in times, our 24/7 online reception, cleaning, trip changes, and extra services at AVEXA Stays.',
  alternates: { canonical: '/faq' },
};

// Answers are arrays of sentences — each renders on its own line (airy, no text
// walls). Inline links use [text](key) tokens resolved via LINKS below, so the
// JSON-LD plain text always mirrors the visible copy.
interface FaqItem {
  q: string;
  a: string[];
}

const LINKS: Record<string, string> = {
  wa: WHATSAPP_URL,
  mail: `mailto:${CONTACT_EMAIL}`,
  cancellation: '/cancellation',
};

const categories: { title: string; items: FaqItem[] }[] = [
  {
    title: 'Online Check-in',
    items: [
      {
        q: 'Why do I need to check in before my arrival?',
        a: [
          'You need to complete the online check-in in advance to receive your self check-in instructions and the PIN code for your apartment.',
          "After booking, you'll get a link to complete this process.",
        ],
      },
      {
        q: 'Where can I see the status of my online check-in?',
        a: [
          'You can easily check the status of your online check-in in the My Trips section on our website.',
        ],
      },
      {
        q: 'When do I receive my PIN code?',
        a: [
          'Once your online check-in is complete, you will receive your PIN code and access instructions at 12:00 PM (Romanian Time) on the day of your arrival.',
        ],
      },
      {
        q: 'Which doors can be opened with the PIN code?',
        a: [
          'Your PIN code will always open your apartment door.',
          'For the main building entrance, you will receive a separate code or a digital tag to use at the intercom (depending on the specific building).',
        ],
      },
    ],
  },
  {
    title: 'Check-in / Check-out',
    items: [
      {
        q: 'What are the check-in and check-out times?',
        a: [
          'Check-in starts at 3:00 PM, and check-out is by 11:00 AM.',
          'We need this time window to professionally prepare and sanitize the apartment to impeccable standards for our next guests.',
        ],
      },
    ],
  },
  {
    title: '24/7 Online Reception',
    items: [
      {
        q: 'How can I contact the online reception?',
        a: [
          "Our reception team operates digitally—they're here for you 24/7 and just a text away.",
          'Feel free to reach out via [WhatsApp](wa) or phone with any questions or concerns.',
        ],
      },
      {
        q: 'Which languages are supported by the online reception?',
        a: [
          'Our online reception team is happy to assist you in English and Romanian.',
        ],
      },
    ],
  },
  {
    title: 'Cleaning Policy & Essentials',
    items: [
      {
        q: 'What is the Avexa cleaning policy?',
        a: [
          'Your apartment is professionally cleaned before your arrival, and the final check-out cleaning is always included in your stay.',
        ],
      },
      {
        q: 'Can I get extra cleaning during my stay?',
        a: [
          'Yes, you can request extra cleaning services for an additional fee directly via My Trips.',
        ],
      },
      {
        q: 'Can I do my laundry at Avexa?',
        a: [
          'Most Avexa properties offer in-room washing machines or access to a laundry room.',
          'You can check the specific amenities for your apartment on My Trips.',
        ],
      },
    ],
  },
  {
    title: 'Trip Management',
    items: [
      {
        q: 'How can I cancel, edit, or extend my stay?',
        a: [
          `AVEXIAN members enjoy flexible cancellation: ${CANCELLATION_POLICY.memberTiers[0].toLowerCase()}, ${CANCELLATION_POLICY.memberTiers[1].toLowerCase()}.`,
          CANCELLATION_POLICY.nonMember,
          CANCELLATION_POLICY.cityTax,
          `To cancel, change dates, or extend your stay, contact us any time at [${CONTACT_EMAIL}](mail) or on [WhatsApp](wa) — our 24/7 reception handles every request.`,
          'Full details are in our [Cancellation Policy](cancellation).',
        ],
      },
      {
        q: 'How can I request an early check-in or a late check-out?',
        a: [
          'Early check-in and late check-out are paid upsells you can book through My Trips, subject to availability on that specific day.',
          'PLATINUM and DIAMOND HERO members can pay for these upsells with their AVX Coins instead.',
        ],
      },
      {
        q: 'When will I know if my early check-in or late check-out request is approved?',
        a: [
          'You will receive a confirmation notification via WhatsApp or SMS within 48 hours of submitting your request.',
          'Early check-in is bookable starting at 1:00 PM, and late check-out until 1:00 PM — these are availability terms, not free benefits.',
        ],
      },
      {
        q: 'Where can I park my car?',
        a: [
          'You can find public paid parking on all the streets surrounding our buildings.',
          'Detailed information, including exact parking locations and the mobile apps you can use to pay, will be provided in your check-in link.',
        ],
      },
    ],
  },
  {
    title: 'Extra Services',
    items: [
      {
        q: 'How can I request a welcome package for my stay?',
        a: [
          'We are happy to provide a welcome package containing a selection of snacks, juices, and water.',
          'Simply request it via My Trips.',
        ],
      },
      {
        q: 'Do you offer room decorations for birthdays or special events?',
        a: [
          'Absolutely! We love helping you celebrate.',
          'We offer custom room decoration services for birthdays, anniversaries, or any special occasion.',
          'Each setup is thoughtfully arranged to make your surprise memorable.',
          'Simply request it in advance via My Trips.',
        ],
      },
    ],
  },
];

const TOKEN_PART = /^\[([^\]]+)\]\((\w+)\)$/;

function plainText(lines: string[]): string {
  return lines.join(' ').replace(/\[([^\]]+)\]\((\w+)\)/g, '$1');
}

function renderLine(line: string): ReactNode {
  return line.split(/(\[[^\]]+\]\(\w+\))/g).map((part, i) => {
    const match = TOKEN_PART.exec(part);
    if (!match) return part;
    const [, text, key] = match;
    const href = LINKS[key] ?? '#';
    const linkClass = 'font-semibold text-gold-dark underline underline-offset-2';
    if (href.startsWith('/')) {
      return (
        <Link key={i} href={href} className={linkClass}>
          {text}
        </Link>
      );
    }
    return (
      <a
        key={i}
        href={href}
        className={linkClass}
        {...(href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {text}
      </a>
    );
  });
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: categories.flatMap((c) =>
    c.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: plainText(f.a) },
    })),
  ),
};

export default function FaqPage() {
  return (
    <div className="bg-cream pt-28 pb-28 md:pt-36 md:pb-36">
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
        <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed text-ink-80">
          Everything about your stay, from online check-in to extra services.
          Cannot find your answer? Our 24/7 reception is one message away at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold text-gold-dark underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <div className="mt-16 space-y-20 md:mt-20 md:space-y-24">
          {categories.map((category) => (
            <section key={category.title}>
              <h2 className="font-mono-label mb-4 text-gold-dark">
                {category.title}
              </h2>
              <div className="flex flex-col">
                {category.items.map((item, i) => (
                  <Reveal key={item.q} direction="up" delay={i * 0.05}>
                    <details className="group border-b border-gray-line [&:first-child]:border-t">
                      <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-lg leading-[1.3] transition-colors duration-200 [&::-webkit-details-marker]:hidden group-open:text-gold-dark group-hover:text-gold-dark">
                        <span className="tracking-[-0.01em]">{item.q}</span>
                        <span
                          aria-hidden
                          className="flex-none font-mono text-[22px] font-normal leading-none text-ink-60 transition-colors duration-200 group-open:text-gold-dark"
                        >
                          <span className="group-open:hidden">+</span>
                          <span className="hidden group-open:inline">−</span>
                        </span>
                      </summary>
                      <div className="max-w-[620px] space-y-3 pt-1 pb-7">
                        {item.a.map((line) => (
                          <p
                            key={line}
                            className="text-[15px] leading-[1.7] text-ink-80"
                          >
                            {renderLine(line)}
                          </p>
                        ))}
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
