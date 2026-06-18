import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://avexastays.com';
const HERO = '/listings/302/02-living-room.jpeg';

export const metadata: Metadata = {
  title: { absolute: 'Bucharest City Guide — What to See, Eat & Do | AVEXA' },
  description:
    'A local guide to Bucharest city center — neighbourhoods, landmarks, where to eat, getting around, and day trips. From the team behind AVEXA Stays.',
  alternates: { canonical: '/guide' },
  openGraph: {
    title: 'Bucharest City Guide — What to See, Eat & Do',
    description:
      'Neighbourhoods, landmarks, food, transit and day trips — a local guide to the heart of Bucharest.',
    url: `${SITE_URL}/guide`,
    type: 'article',
    images: [{ url: `${SITE_URL}${HERO}`, width: 1200, height: 800, alt: 'Bucharest city center' }],
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Bucharest, like a local — the AVEXA city guide',
  description:
    'A local guide to Bucharest city center: neighbourhoods, landmarks, food, getting around, and day trips.',
  image: `${SITE_URL}${HERO}`,
  inLanguage: 'en',
  datePublished: '2026-06-17',
  dateModified: '2026-06-17',
  mainEntityOfPage: `${SITE_URL}/guide`,
  author: { '@type': 'Organization', name: 'AVEXA Stays', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'AVEXA Stays',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/opengraph-image` },
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Bucharest Guide', item: `${SITE_URL}/guide` },
  ],
};

interface Section {
  id: string;
  heading: string;
  body: string[];
}

const sections: Section[] = [
  {
    id: 'neighbourhoods',
    heading: 'The neighbourhoods',
    body: [
      "Old City Center (Lipscani) is the historic core: cobblestoned, pedestrian, and loud in the best way after dark. Stavropoleos Monastery, the century-old Caru' cu Bere, and a hundred terraces sit within a few minutes' walk.",
      "Calea Victoriei is the city's most elegant axis, running past the Athenaeum, the former Royal Palace, and a long run of boutiques and cafés. It is the address to stay on if you want grandeur on your doorstep.",
      'Universitate is the geographic heart and main transit hub — the National Theatre, the university, and a metro interchange that puts the whole city within reach.',
      "Piața Romană and Dorobanți, just north, are quieter and leafier — business-and-embassy territory with some of the city's best independent restaurants nearby.",
    ],
  },
  {
    id: 'see',
    heading: 'What to see',
    body: [
      "The Palace of Parliament is the colossal seat of power that anchors the city's south — best appreciated on a guided tour, or from the long boulevard that leads up to it.",
      'The Romanian Athenaeum is the most beautiful concert hall in the city, steps from the National Museum of Art of Romania in the former Royal Palace on Revolution Square.',
      'Cișmigiu Gardens are made for a slow afternoon; King Michael I Park and the open-air Village Museum are an easy half-day, with the Arcul de Triumf on the way.',
      'Cărturești Carusel, a light-filled bookshop in a restored 19th-century building, is worth the detour even if you never open a Romanian title.',
    ],
  },
  {
    id: 'eat',
    heading: 'Where to eat & drink',
    body: [
      "Eat Romanian at least once: sarmale (stuffed cabbage rolls), mici (grilled minced meat), and a sour ciorbă. Caru' cu Bere, a century-old beer hall, is touristy and wonderful in equal measure.",
      "Bucharest's specialty-coffee scene is genuinely good — you are never far from a serious flat white in the centre. After dark, the Old Town hides cocktail bars behind unmarked doors.",
      'For produce and atmosphere, Obor is the oldest and largest market in the city. For a proper dinner out, the Dorobanți and Floreasca districts hold most of the standout tables.',
    ],
  },
  {
    id: 'around',
    heading: 'Getting around',
    body: [
      'The centre is walkable end to end. For longer hops, the metro (lines M1–M5) is fast and cheap, with Universitate and Piața Romană the most useful central stops.',
      'Trams and buses fill the gaps, and ride-hailing (Bolt, Uber) is inexpensive and everywhere — you will rarely wait more than a few minutes.',
      'From Henri Coandă (Otopeni) airport, the 783 express bus and a direct train both reach the centre; a ride-hail takes 30–45 minutes depending on traffic.',
    ],
  },
  {
    id: 'day-trips',
    heading: 'Day trips',
    body: [
      "The Carpathians start about two hours away. Sinaia's Peleș Castle is the fairy-tale highlight; Bran Castle and the medieval streets of Brașov together make a full, rewarding day.",
      'Closer in, Snagov lake and its island monastery are an easy escape from the summer heat.',
    ],
  },
  {
    id: 'when',
    heading: 'When to visit',
    body: [
      'Late spring (April–June) and early autumn (September–October) are the sweet spots — warm, green, and made for terraces. Summer runs hot and lively, with festivals and late nights; winter is quiet, atmospheric, and festive around the holidays.',
    ],
  },
];

const tips: { label: string; value: string }[] = [
  { label: 'Currency', value: 'Romanian leu (RON). Cards work almost everywhere; keep a little cash for markets.' },
  { label: 'Language', value: 'Romanian. English is widely spoken in the centre, especially by younger people.' },
  { label: 'Tipping', value: 'Around 10% in restaurants when the service is good.' },
  { label: 'Power', value: '230V, Type C/F plugs — the standard EU two-pin.' },
];

export default function GuidePage() {
  return (
    <article className="bg-cream">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* ── HERO ──────────────────────────────────────────────
          Height is set in viewport units (svh) and the image fills it with
          object-cover. Because the viewport's apparent size is constant under
          browser zoom, the hero image keeps the same on-screen size when you
          zoom in/out — only the rem/clamp text inside it scales. */}
      <section className="relative h-[82svh] min-h-[440px] w-full overflow-hidden bg-ink">
        <Image
          src={HERO}
          alt="A bright living room in an AVEXA apartment in central Bucharest"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,15,15,.45) 0%, rgba(15,15,15,.05) 35%, rgba(15,15,15,.78) 100%)',
          }}
        />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 text-cream md:px-10 md:pb-24">
            <p className="font-mono-label text-gold">The AVEXA Guide</p>
            <h1
              className="font-display mt-3 max-w-[16ch]"
              style={{ fontSize: 'clamp(40px, 7vw, 84px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}
            >
              Bucharest, like a local.
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-cream/80">
              The neighbourhoods, the landmarks, the tables worth booking — and how
              to move through the city like you have been here before.
            </p>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="mx-auto max-w-[760px] px-6 py-20 md:px-10 md:py-28">
        <Reveal direction="up">
          <p className="text-[19px] leading-[1.7] text-ink-80">
            Bucharest rewards the curious. Romania&apos;s capital is a city of grand
            boulevards and hidden courtyards, Belle Époque palaces and brutalist
            landmarks, late dinners and longer mornings. AVEXA&apos;s apartments sit
            right in the Bucharest city center — so this guide starts where you will
            be standing.
          </p>
        </Reveal>

        {sections.map((s) => (
          <Reveal key={s.id} direction="up" className="mt-14">
            <section id={s.id}>
              <h2 className="font-display text-2xl tracking-[-0.01em] md:text-3xl">
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-[16px] leading-[1.75] text-ink-80">
                    {p}
                  </p>
                ))}
              </div>

              {/* Where-to-stay callout under the neighbourhoods section */}
              {s.id === 'neighbourhoods' && (
                <div className="mt-6 rounded-card border border-gray-line bg-white p-5">
                  <p className="text-[15px] text-ink-80">
                    Every AVEXA suite sits in one of these districts.{' '}
                    <Link href="/locations" className="font-semibold text-gold-dark underline underline-offset-2">
                      Browse all locations
                    </Link>{' '}
                    to pick your corner of the city.
                  </p>
                </div>
              )}
            </section>
          </Reveal>
        ))}

        {/* Practical tips */}
        <Reveal direction="up" className="mt-14">
          <h2 className="font-display text-2xl tracking-[-0.01em] md:text-3xl">
            Good to know
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {tips.map((t) => (
              <div key={t.label}>
                <dt className="font-mono-label text-gold-dark">{t.label}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-ink-80">{t.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* ── CTA ── */}
      <section className="bg-ink px-6 py-20 text-cream md:py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="font-display text-3xl md:text-4xl">Stay in the middle of it.</h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-cream/70">
            Design-led apartments in the heart of Bucharest, booked direct — with the
            best rate reserved for members.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/locations"
              className="rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:bg-gold-pale"
            >
              Browse stays
            </Link>
            <Link
              href="/member-benefits"
              className="rounded-full border border-cream/25 px-7 py-3.5 font-semibold text-cream transition hover:border-gold hover:text-gold"
            >
              Member benefits
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
