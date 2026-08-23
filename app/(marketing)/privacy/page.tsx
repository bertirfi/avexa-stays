import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { Sentences } from '@/components/shared/Sentences';
import { CONTACT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Avexa Stays (Prime Gold Living SRL) collects, uses, and safeguards your personal data under the GDPR — bookings, My Trips, and online check-in.',
  alternates: { canonical: '/privacy' },
};

const CONTROLLER = [
  { label: 'Company Name', value: 'Prime Gold Living SRL' },
  { label: 'Registration Number (CUI)', value: '52265361' },
  { label: 'Trade Register Number', value: 'J2025057993006' },
  {
    label: 'Registered Office',
    value: 'Str. Fibrei 28, Bucuresti, Sector 2, Cod 020342, Romania',
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="28 July 2026"
      intro="Welcome to Avexa Stays. We are committed to protecting and respecting your privacy."
    >
      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how we collect, use, and safeguard your
        personal data when you use our website, book our accommodations, and use
        our “My Trips” and online check-in services.
      </p>
      <p>
        We do so in compliance with the General Data Protection Regulation
        (GDPR) (EU) 2016/679 and applicable Romanian laws.
      </p>

      <h3>Data Controller Information</h3>
      <dl className="mb-4 mt-5 space-y-4 sm:space-y-3">
        {CONTROLLER.map((row) => (
          <div key={row.label} className="sm:grid sm:grid-cols-[240px_1fr] sm:gap-x-8">
            <dt className="font-mono-label text-ink-60">{row.label}</dt>
            <dd className="mt-1 text-ink sm:mt-0">{row.value}</dd>
          </div>
        ))}
        <div className="sm:grid sm:grid-cols-[240px_1fr] sm:gap-x-8">
          <dt className="font-mono-label text-ink-60">Contact Email</dt>
          <dd className="mt-1 text-ink sm:mt-0">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </dd>
        </div>
      </dl>

      <h2>2. What Personal Data We Collect</h2>
      <ul>
        <li>
          <strong>Identity Data:</strong> First name, last name, and your
          ID/Passport information (strictly required by Romanian law for tourist
          registration).
        </li>
        <li>
          <strong>Contact Data:</strong> Email address, phone number (used for
          WhatsApp/SMS notifications and PIN delivery), and billing address.
        </li>
        <li>
          <strong>Transaction Data:</strong>{' '}
          <Sentences text="Payment details processed securely by our third-party payment provider Stripe. We do not store your full credit card details on our servers." />
        </li>
        <li>
          <strong>Booking Data:</strong> Arrival and departure dates,
          check-in/check-out requests, and extra service preferences (e.g.,
          welcome packages, room decorations).
        </li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>
          To process your booking, manage your stay via “My Trips,” and handle
          your payments.
        </li>
        <li>
          To send you essential self check-in instructions and access PINs prior
          to your arrival.
        </li>
        <li>To provide customer support through our 24/7 online reception.</li>
        <li>
          To comply with legal obligations in Romania, including accounting
          regulations and the mandatory registration of tourists with the local
          authorities.
        </li>
      </ul>

      <h2>4. How We Share Your Data</h2>
      <p>We do not sell your personal data.</p>
      <p>
        We only share it with trusted third parties strictly necessary for our
        operations:
      </p>
      <ul>
        <li>
          <strong>Payment Processors:</strong> Stripe, to securely process your
          transactions.
        </li>
        <li>
          <strong>IT &amp; Hosting Providers:</strong> To maintain the security
          and functionality of our website and booking system.
        </li>
        <li>
          <strong>Public Authorities:</strong> As required by Romanian law, we
          may share identity data with local law enforcement or tourism
          authorities.
        </li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We will only retain your personal data for as long as necessary to
        fulfill the purposes we collected it for.
      </p>
      <p>
        Booking and communication data are kept to handle any post-stay queries.
      </p>
      <p>
        Financial and billing records are kept for 10 years, as strictly
        required by Romanian accounting and tax laws.
      </p>
      <p>
        Identity data collected for tourist registration is retained according
        to the statutory periods mandated by Romanian legislation.
      </p>

      <h2>6. Your GDPR Rights</h2>
      <p>Under the GDPR, you have the right to:</p>
      <ul>
        <li>Access your personal data.</li>
        <li>Rectification of inaccurate data.</li>
        <li>
          Erasure (“Right to be forgotten”), provided there is no legal
          obligation to retain the data.
        </li>
        <li>Restriction of, or objection to, processing.</li>
        <li>Data portability.</li>
      </ul>
      <p>
        To exercise any of these rights, contact{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>We will respond within 30 days.</p>

      <h2>7. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes
        in legal requirements or our operational processes.
      </p>
      <p>Any updates will be published on this page.</p>
    </LegalShell>
  );
}
