import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How AVEXA Stays (PRIME GOLD LIVING SRL) collects, uses, and protects your personal data under the GDPR.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="17 June 2026"
      intro="This policy explains what personal data we collect when you use AVEXA Stays, why we process it, and the rights you have under the EU General Data Protection Regulation (GDPR)."
    >
      <h2>Data controller</h2>
      <p>
        The controller responsible for your personal data is{' '}
        <strong>PRIME GOLD LIVING SRL</strong>, Str. Fibrei 28, Sector 2, 020342
        Bucharest, Romania (CUI 52265361, Trade Register J2025057993006). For any
        privacy question, contact{' '}
        <a href="mailto:hello@avexastays.com">hello@avexastays.com</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> your name and email address when you
          create an account or sign in.
        </li>
        <li>
          <strong>Booking data:</strong> stay dates, number and type of guests,
          the apartment booked, and any requests or preferences you share.
        </li>
        <li>
          <strong>Payment data:</strong> payments are processed by our payment
          provider. We receive a confirmation and the last digits of your card —
          we never store full card numbers.
        </li>
        <li>
          <strong>Communications:</strong> messages you send us and our replies.
        </li>
        <li>
          <strong>Usage data:</strong> basic technical information (device,
          browser, pages viewed) used to operate and improve the site.
        </li>
      </ul>

      <h2>Why we process it &amp; legal basis</h2>
      <ul>
        <li>
          <strong>To provide your booking</strong> — performance of a contract
          (Art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>To run and secure the website</strong> — our legitimate
          interest (Art. 6(1)(f) GDPR).
        </li>
        <li>
          <strong>To comply with legal and tax obligations</strong> — legal
          obligation (Art. 6(1)(c) GDPR).
        </li>
        <li>
          <strong>Marketing and optional analytics</strong> — only with your
          consent (Art. 6(1)(a) GDPR), which you may withdraw at any time.
        </li>
      </ul>

      <h2>Service providers</h2>
      <p>
        We share data only with processors that help us deliver the service,
        under appropriate data-processing agreements: our property-management
        system (booking and availability), our payment processor (payments), our
        database and authentication provider, our email provider (booking and
        transactional emails), and our hosting provider. Where a provider is
        outside the EU/EEA, transfers are protected by Standard Contractual
        Clauses or an adequacy decision.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep booking and invoicing records for as long as required by Romanian
        tax and accounting law, and account data until you close your account.
        Data no longer needed is deleted or anonymised.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you have the right to access, rectify, erase, restrict, and
        port your data, and to object to certain processing. To exercise any of
        these, email{' '}
        <a href="mailto:hello@avexastays.com">hello@avexastays.com</a>. You also
        have the right to lodge a complaint with the Romanian Data Protection
        Authority (ANSPDCP),{' '}
        <a href="https://www.dataprotection.ro" rel="noopener noreferrer" target="_blank">
          dataprotection.ro
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies that are strictly necessary for the site to function.
        Optional analytics or marketing cookies are set only with your consent,
        and you can change your choice at any time.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. The current version is always
        available on this page, with the “last updated” date shown above.
      </p>
    </LegalShell>
  );
}
