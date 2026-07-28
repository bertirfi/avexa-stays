import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CONTACT_EMAIL, PHONE_DISPLAY, PHONE_TEL } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Imprint & Legal Notice',
  description:
    'Legal information and company details for Avexa Stays, operated by Prime Gold Living SRL, Bucharest, Romania.',
  alternates: { canonical: '/imprint' },
};

const COMPANY = [
  { label: 'Company Name', value: 'Prime Gold Living SRL' },
  {
    label: 'Registered Office',
    value: 'Str. Fibrei 28, Bucuresti, Sector 2, Cod 020342, Romania',
  },
  { label: 'Trade Register Number', value: 'J2025057993006' },
  { label: 'Tax Identification Number (CUI/CIF)', value: 'RO52265361' },
] as const;

export default function ImprintPage() {
  return (
    <LegalShell
      title="Imprint & Legal Notice"
      updated="28 July 2026"
      intro="Legal information about the company operating the Avexa Stays website and booking service."
    >
      <h2>Company Information</h2>
      <dl className="mb-4 mt-5 space-y-4 sm:space-y-3">
        {COMPANY.map((row) => (
          <div key={row.label} className="sm:grid sm:grid-cols-[240px_1fr] sm:gap-x-8">
            <dt className="font-mono-label text-ink-60">{row.label}</dt>
            <dd className="mt-1 text-ink sm:mt-0">{row.value}</dd>
          </div>
        ))}
      </dl>

      <h2>Contact Information</h2>
      <dl className="mb-4 mt-5 space-y-4 sm:space-y-3">
        <div className="sm:grid sm:grid-cols-[240px_1fr] sm:gap-x-8">
          <dt className="font-mono-label text-ink-60">Email</dt>
          <dd className="mt-1 text-ink sm:mt-0">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </dd>
        </div>
        <div className="sm:grid sm:grid-cols-[240px_1fr] sm:gap-x-8">
          <dt className="font-mono-label text-ink-60">Phone</dt>
          <dd className="mt-1 text-ink sm:mt-0">
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </dd>
        </div>
      </dl>

      <h2>Online Dispute Resolution (ODR)</h2>
      <p>
        The European Commission provides a platform for online dispute
        resolution (ODR), found at{' '}
        <a
          href="http://ec.europa.eu/consumers/odr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
      <p>
        We are neither obligated nor willing to participate in a dispute
        settlement procedure before a consumer arbitration board.
      </p>
    </LegalShell>
  );
}
