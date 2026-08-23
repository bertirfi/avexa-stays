import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getPropertyData,
  getAllPropertiesData,
  getAllPropertySlugIds,
} from '@/lib/data/properties';
import { StayGallery } from '@/components/stay/StayGallery';
import { StayHeader } from '@/components/stay/StayHeader';
import {
  StayDescription,
  StayGoodToKnow,
  StayFAQ,
  StayLocation,
  StayTestimonials,
} from '@/components/stay/StayContent';
import { StayAmenities } from '@/components/stay/StayAmenities';
import { StayBookingSidebar } from '@/components/stay/StayBookingSidebar';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSiblingIds } from '@/lib/roomGroups';
import { getAvailabilityMap } from '@/lib/data/availability';
import { getFxRateEur } from '@/lib/pricing';
import type { Property } from '@/types';

// ISR — refresh live price/availability from Supabase every 15 minutes.
export const revalidate = 900;

const SITE_URL = 'https://avexastays.com';

interface Params {
  slug: string;
}

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

/**
 * rates[].perNight is RON (money of record); JSON-LD keeps the site's default
 * display currency (EUR), so the offer/priceRange prices are converted here.
 */
function buildLodgingSchema(property: Property, fxRateEur: number) {
  const rate = property.rates[0];
  const priceEur = Math.round(rate.perNight / fxRateEur);

  const ratings = property.reviews
    .map((r) => r.rating)
    .filter((n) => typeof n === 'number');
  const ratingValue =
    ratings.length > 0
      ? Number(
          (ratings.reduce((sum, n) => sum + n, 0) / ratings.length).toFixed(1),
        )
      : null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Apartment', 'LodgingBusiness', 'Product'],
    name: property.name,
    // Curated + unique per suite (the editorial paragraphs repeat across suites).
    description: property.metaDescription,
    image: absoluteUrl(property.cover),
    url: `${SITE_URL}/locations/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: 'Bucharest',
      addressCountry: 'RO',
    },
    priceRange: `From €${priceEur} / night`,
    offers: {
      '@type': 'Offer',
      price: priceEur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/locations/${property.slug}`,
    },
    numberOfRooms: property.maxGuests,
    petsAllowed: false,
  };

  if (ratingValue !== null) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount: ratings.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

function buildBreadcrumbSchema(property: Property) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations',
        item: `${SITE_URL}/locations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.neighborhoodLabel,
        item: `${SITE_URL}/locations?where=${property.neighborhood}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.name,
        item: `${SITE_URL}/locations/${property.slug}`,
      },
    ],
  };
}

export function generateStaticParams(): Params[] {
  // Emit both the numeric id and the slug form; canonical resolves to the slug.
  return getAllPropertySlugIds().flatMap(({ id, slug }) => [{ slug: id }, { slug }]);
}

export async function generateMetadata(
  props: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await getPropertyData(slug);
  if (!property) return { title: 'Stay not found' };
  // Curated per-property SERP copy — unique and ≤155 chars (SEO hard rule);
  // the editorial description paragraphs are too long and repeat across suites.
  const description = property.metaDescription;
  const title = property.metaTitle ?? `${property.name} — ${property.subtitle}`;
  return {
    title,
    description,
    // Canonical always points to the slug URL (the id form is a duplicate).
    alternates: { canonical: `/locations/${property.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/locations/${property.slug}`,
      type: 'website',
      images: [{ url: absoluteUrl(property.cover), width: 1200, height: 800, alt: property.name }],
    },
  };
}

export default async function StayPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const property = await getPropertyData(slug);
  if (!property) notFound();

  const allOthers = await getAllPropertiesData();
  const others = allOthers.filter((p) => p.id !== property.id).slice(0, 4);

  const siblingIds = getSiblingIds(property.id);
  const siblings = allOthers.filter((p) => siblingIds.includes(p.id));

  // Per-night prices + availability for the calendar (graceful: {} when offline).
  const availability = await getAvailabilityMap(property.id);

  // rates[].perNight is RON; this server boundary renders EUR (site default
  // display currency) directly — both in JSON-LD and the "More suites" footer.
  const fxRateEur = getFxRateEur();

  return (
    <div className="bg-cream pt-24 md:pt-32 pb-[150px] md:pb-0">
      <JsonLd data={buildLodgingSchema(property, fxRateEur)} />
      <JsonLd data={buildBreadcrumbSchema(property)} />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Breadcrumb */}
        <nav className="font-mono-label mb-4 flex items-center gap-2 text-ink-60">
          <Link href="/locations" className="hover:text-gold-dark">Locations</Link>
          <span aria-hidden>›</span>
          <Link
            href={`/locations?where=${property.neighborhood}`}
            className="hover:text-gold-dark"
          >
            {property.neighborhoodLabel}
          </Link>
          <span aria-hidden>›</span>
          <span className="text-ink">{property.name}</span>
        </nav>

        {/* Gallery */}
        <StayGallery photos={property.photos} name={property.name} />

        {/* Header · booking box · content.
            Mobile (1 col): DOM order = header → booking box → sections, so
            price + dates land right under the gallery (Numa-style).
            lg (2 cols): auto-placement puts the header at col1/row1, the
            booking box at col2 spanning BOTH rows (so `sticky` has the full
            column to travel in), and the sections at col1/row2 — i.e. the
            two-column layout is unchanged. */}
        <div className="mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-[1fr_380px] lg:gap-y-0">
          <StayHeader property={property} />

          <div className="lg:row-span-2 lg:min-w-0">
            <StayBookingSidebar property={property} siblings={siblings} availability={availability} />
          </div>

          <div>
            <StayDescription property={property} />
            <StayAmenities property={property} />
            <StayGoodToKnow property={property} />
            <StayFAQ property={property} />
            <StayLocation property={property} />
            <StayTestimonials property={property} />
          </div>
        </div>

        {/* Other suites footer */}
        <section className="border-t border-gray-line py-12">
          <h2 className="font-display mb-6 text-2xl">More AVEXA suites</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {others.map((p) => (
                <Link
                  key={p.id}
                  href={`/locations/${p.slug}`}
                  className="group block"
                >
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-card bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.cover})` }}
                  >
                    <span className="font-display absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold tracking-normal text-ink">
                      €{Math.round(p.rates[0].perNight / fxRateEur)}
                    </span>
                  </div>
                  <h3 className="font-display mt-2 text-base group-hover:text-gold-dark">
                    {p.name}
                  </h3>
                  <p className="text-xs text-ink-60">{p.subtitle}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
