import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Imprint',
  description:
    'Legal information and company details for AVEXA Stays, operated by PRIME GOLD LIVING SRL, Bucharest, Romania.',
  alternates: { canonical: '/imprint' },
};

export default function ImprintPage() {
  return (
    <LegalShell
      title="Imprint"
      updated="17 June 2026"
      intro="Legal information about the company operating the AVEXA Stays website and booking service."
    >
      <h2>Company details</h2>
      <p>
        <strong>PRIME GOLD LIVING SRL</strong>
        <br />
        Str. Fibrei 28, Sector 2
        <br />
        020342 Bucharest, Romania
      </p>

      <h2>Registration</h2>
      <ul>
        <li>
          <strong>Trade Register number:</strong> J2025057993006
        </li>
        <li>
          <strong>Sole registration code (CUI):</strong> 52265361
        </li>
        <li>
          <strong>EUID:</strong> ROONRC.J2025057993006
        </li>
        <li>
          <strong>Date of incorporation:</strong> 1 August 2025
        </li>
      </ul>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:hello@avexastays.com">hello@avexastays.com</a>
        <br />
        Website: <a href="https://avexastays.com">avexastays.com</a>
      </p>

      <h2>Consumer dispute resolution</h2>
      <p>
        AVEXA Stays operates under Romanian and EU consumer-protection law. For
        complaints, you may contact the Romanian National Authority for Consumer
        Protection (ANPC) at{' '}
        <a href="https://anpc.ro" rel="noopener noreferrer" target="_blank">
          anpc.ro
        </a>
        . The European Commission also provides an Online Dispute Resolution
        platform at{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          rel="noopener noreferrer"
          target="_blank"
        >
          ec.europa.eu/consumers/odr
        </a>
        . We are neither obliged nor generally willing to participate in dispute
        resolution proceedings before a consumer arbitration board, but we always
        aim to resolve any issue directly and fairly.
      </p>

      <h2>Liability for content</h2>
      <p>
        We prepare the content of this website with care. However, we assume no
        liability for the accuracy, completeness, or timeliness of the content.
        Listings, prices, and availability are subject to change and are confirmed
        at the moment of booking.
      </p>
    </LegalShell>
  );
}
