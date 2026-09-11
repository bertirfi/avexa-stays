import { CONTACT_EMAIL, PHONE_TEL } from '@/lib/contact';

export const SITE_URL = 'https://avexastays.com';

/**
 * Brand entity for Google / LLMs, rendered on EVERY page (root layout).
 * `alternateName` is what lets Google tie the bare query "Avexa" to this
 * site and pick "AVEXA" as the site name in results. No `sameAs`: none of
 * the social accounts exist yet (client review 24.08) — a dead profile is a
 * negative signal, add them back when Vlad creates the accounts.
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'AVEXA Stays',
  alternateName: ['AVEXA', 'Avexa', 'Avexa Stays'],
  legalName: 'Prime Gold Living SRL',
  taxID: 'RO52265361',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/apple-icon.png`,
    width: 180,
    height: 180,
  },
  image: `${SITE_URL}/opengraph-image`,
  description:
    'AVEXA Stays is a Bucharest-based host of premium short and medium-stay apartments in the city center — Calea Victoriei, Old Town and Piața Romană — booked direct, with digital check-in and no front desk.',
  foundingLocation: { '@type': 'Place', name: 'Bucharest, Romania' },
  founder: [
    { '@type': 'Person', name: 'Anca Smighelschi' },
    { '@type': 'Person', name: 'Vlad Smighelschi' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bucharest',
    addressCountry: 'RO',
  },
  areaServed: { '@type': 'City', name: 'Bucharest' },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: PHONE_TEL.replace('tel:', ''),
    email: CONTACT_EMAIL,
    availableLanguage: ['en', 'ro'],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'AVEXA',
  alternateName: ['AVEXA Stays', 'Avexa Stays', 'Avexa'],
  url: SITE_URL,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
};
