import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { Sentences } from '@/components/shared/Sentences';
import { CONTACT_EMAIL, PHONE_DISPLAY, PHONE_TEL } from '@/lib/contact';
import { SITE_URL } from '@/lib/seo/brand-schema';

export const metadata: Metadata = {
  title: 'About AVEXA',
  description:
    'AVEXA Stays is a Bucharest host of premium city-center apartments on Calea Victoriei, in the Old Town and near Piața Romană — booked direct, digital check-in, hosted by Anca and Vlad Smighelschi.',
  alternates: { canonical: '/about' },
};

// Plain, entity-clear copy: who AVEXA is, where, who hosts. Written for a
// reader first, but every sentence is also a fact Google/AI answers can quote.
const STORY = [
  'AVEXA Stays is a Bucharest-based host of premium short and medium-stay apartments in the city center.',
  'Our suites sit on Calea Victoriei, in the Old Town and near Piața Romană — the streets where the city actually happens.',
  'Every apartment is booked directly on this site, at direct rates, with digital check-in and no front desk.',
];

const HOSTS = [
  'AVEXA is run by Anca Smighelschi and Vlad Smighelschi, the hosts behind every stay.',
  'They renovated and furnished each apartment themselves, and they answer the WhatsApp line personally.',
  'The company behind the brand is Prime Gold Living SRL, registered in Bucharest, Romania.',
];

const PRINCIPLES = [
  {
    title: 'No front desk.',
    body: 'Online check-in before arrival, a personal PIN code, and keys that are never lost.',
  },
  {
    title: 'No friction.',
    body: 'One price with taxes included, a 2-minute booking, and a 24/7 human reception on WhatsApp.',
  },
  {
    title: 'No compromise.',
    body: 'Freshly renovated suites, premium linens, fully equipped kitchens, and a member programme that rewards every stay with AVEXA Coins.',
  },
];

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#page`,
  url: `${SITE_URL}/about`,
  name: 'About AVEXA',
  about: { '@id': `${SITE_URL}/#organization` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
};

export default function AboutPage() {
  return (
    <div className="bg-cream pt-28 pb-28 md:pt-36 md:pb-36">
      <JsonLd data={aboutSchema} />
      <div className="mx-auto max-w-[820px] px-6 md:px-10">
        <nav className="font-mono-label mb-5 text-ink-60">
          <Link href="/" className="hover:text-gold-dark">
            Home
          </Link>
          <span aria-hidden className="mx-2">
            ›
          </span>
          <span className="text-ink">About</span>
        </nav>

        <Reveal direction="up">
          <p className="font-mono-label text-gold-dark">— About AVEXA</p>
          <h1 className="font-display mt-3.5 text-3xl tracking-[-0.02em] md:text-[44px] md:leading-[1.05]">
            Bucharest city center apartments, hosted the way we would want to be hosted.
          </h1>
          <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-ink-80">
            <Sentences text={STORY.join(' ')} />
          </p>
        </Reveal>

        <Reveal direction="up" className="relative mt-14 aspect-[16/9] overflow-hidden rounded-card">
          <Image
            src="/listing-photos/30-living-room.jpeg"
            alt="Living room of an AVEXA Stays apartment on Calea Victoriei, Bucharest"
            fill
            sizes="(min-width: 820px) 820px, 100vw"
            className="object-cover"
            priority
          />
        </Reveal>

        <section className="mt-16 md:mt-20">
          <h2 className="font-mono-label mb-4 text-gold-dark">— Your hosts</h2>
          <p className="max-w-[60ch] text-[17px] leading-relaxed text-ink-80">
            <Sentences text={HOSTS.join(' ')} />
          </p>
        </section>

        <section className="mt-16 md:mt-20">
          <h2 className="font-mono-label mb-6 text-gold-dark">— What we stand for</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-[20px] border border-gray-line bg-white p-6">
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-ink-80">
                  <Sentences text={p.body} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <h2 className="font-mono-label mb-4 text-gold-dark">— Say hello</h2>
          <p className="max-w-[60ch] text-[17px] leading-relaxed text-ink-80">
            <span className="block">
              Write to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-gold-dark underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>{' '}
              or call{' '}
              <a href={PHONE_TEL} className="font-semibold text-gold-dark underline underline-offset-2">
                {PHONE_DISPLAY}
              </a>
              .
            </span>
            <span className="block">Fast human support on WhatsApp, every day.</span>
          </p>
          <Link
            href="/locations"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-display text-[15px] font-bold text-cream transition hover:bg-gold hover:text-ink"
          >
            See all apartments →
          </Link>
        </section>
      </div>
    </div>
  );
}
