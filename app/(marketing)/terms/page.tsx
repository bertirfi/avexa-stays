import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms governing bookings and use of AVEXA Stays, operated by PRIME GOLD LIVING SRL, Bucharest.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      updated="17 June 2026"
      intro="These terms govern your use of the AVEXA Stays website and any booking you make through it. By booking, you agree to them."
    >
      <h2>1. Who we are</h2>
      <p>
        The AVEXA Stays service is operated by <strong>PRIME GOLD LIVING SRL</strong>,
        Str. Fibrei 28, Sector 2, 020342 Bucharest, Romania (CUI 52265361, Trade
        Register J2025057993006). Full company details are in our{' '}
        <Link href="/imprint">Imprint</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        We offer fully furnished apartments in central Bucharest for short and
        medium stays, booked directly through this website with digital,
        front-desk-free check-in. Each listing describes the apartment, its
        amenities, and house rules.
      </p>

      <h2>3. Booking &amp; contract</h2>
      <p>
        A booking is a request to stay for the dates and apartment you select. The
        contract is formed once we confirm your booking and payment is
        successfully processed. We confirm by email. We may decline or cancel a
        booking in case of payment failure, suspected fraud, or unavailability,
        in which case any amount paid is refunded.
      </p>

      <h2>4. Prices &amp; payment</h2>
      <p>
        Prices are shown in euro (EUR) and include applicable taxes such as the
        local city tax unless stated otherwise. The price shown at the moment of
        payment is the price that applies. Payment is taken securely through our
        payment provider at the time of booking. Member rates apply automatically
        once you are signed in.
      </p>

      <h2>5. Check-in, check-out &amp; access</h2>
      <p>
        Standard check-in and check-out times are shown on each listing and in
        your confirmation. Access codes or instructions are sent before arrival.
        You are responsible for keeping access details secure.
      </p>

      <h2>6. Guest responsibilities</h2>
      <ul>
        <li>Provide accurate booking and guest information.</li>
        <li>Respect the apartment, neighbours, and house rules (including occupancy limits and no-party / quiet-hours policies).</li>
        <li>Report any damage promptly. You are responsible for damage caused during your stay.</li>
      </ul>

      <h2>7. Cancellation</h2>
      <p>
        Cancellations and refunds are governed by our{' '}
        <Link href="/cancellation">Cancellation Policy</Link>, which forms part of
        these terms.
      </p>

      <h2>8. Liability</h2>
      <p>
        We provide the apartment as described and take reasonable care to keep it
        safe and accurate. To the extent permitted by law, we are not liable for
        indirect or consequential loss, or for circumstances beyond our reasonable
        control. Nothing in these terms limits liability that cannot be limited by
        law.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by Romanian law. Mandatory consumer-protection
        rights in your country of residence remain unaffected. Consumers may also
        use the EU Online Dispute Resolution platform at{' '}
        <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these terms from time to time. The version in force is the
        one published on this page at the time of your booking.
      </p>
    </LegalShell>
  );
}
