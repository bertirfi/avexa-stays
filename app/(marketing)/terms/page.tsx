import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/LegalShell';
import { Sentences } from '@/components/shared/Sentences';

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
      updated="28 July 2026"
      intro="These terms govern your use of the AVEXA Stays website and any booking you make through it. By booking, you agree to them in full."
    >
      <h2>1. Who we are</h2>
      <p>
        The AVEXA Stays service is operated by <strong>PRIME GOLD LIVING SRL</strong>,
        Str. Fibrei 28, Sector 2, 020342 Bucharest, Romania (CUI 52265361, Trade
        Register J2025057993006).
      </p>
      <p>
        Full company details are in our <Link href="/imprint">Imprint</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        We offer fully furnished apartments in central Bucharest for short and
        medium stays, booked directly through this website with digital,
        front-desk-free check-in.
      </p>
      <p>Each listing describes the apartment, its amenities, and specific house rules.</p>

      <h2>3. Booking &amp; contract</h2>
      <p>To make a booking, you must be at least 18 years old.</p>
      <p>A booking is a request to stay for the dates and apartment you select.</p>
      <p>
        <Sentences text="The contract is formed once we confirm your booking and payment is successfully processed. We confirm by email." />
      </p>
      <p>
        As required by Romanian law, a valid government-issued ID/Passport must be
        provided prior to check-in.
      </p>
      <p>
        We may decline or cancel a booking in case of payment failure, suspected
        fraud, failure to provide ID, or unavailability, in which case any
        eligible amount paid is refunded.
      </p>

      <h2>4. Prices &amp; payment</h2>
      <p>
        Prices are shown in euros (EUR) and include applicable taxes unless
        stated otherwise.
      </p>
      <p>The price shown at the moment of payment is the price that applies.</p>
      <p>
        Payment is charged in Romanian lei (RON); the exact RON amount is always
        shown before you pay.
      </p>
      <p>
        Payment is taken securely through our payment provider at the time of
        booking.
      </p>

      <h2>5. Check-in, check-out &amp; access</h2>
      <p>
        Standard check-in and check-out times are shown on each listing and in
        your confirmation.
      </p>
      <p>
        Access codes or instructions are sent before arrival, provided the online
        check-in is complete.
      </p>
      <p>You are responsible for keeping access details secure.</p>

      <h2>6. Guest responsibilities &amp; House Rules</h2>
      <p>By staying with us, you agree to the following:</p>
      <ul>
        <li>
          <strong>Information:</strong>{' '}
          <Sentences text="Provide accurate booking and guest information. Unregistered guests are not permitted." />
        </li>
        <li>
          <strong>Respect the property:</strong>{' '}
          <Sentences text="Respect the apartment, neighbors, and house rules. Parties, events, and loud noises are strictly prohibited." />
        </li>
        <li>
          <strong>No Smoking:</strong> All Avexa properties are strictly
          non-smoking.
        </li>
        <li>
          <strong>Pets:</strong> Pets are not allowed unless explicitly stated
          otherwise in the specific apartment&apos;s listing.
        </li>
        <li>
          <strong>Damages &amp; Penalties:</strong>{' '}
          <Sentences text="You are entirely responsible for any damage, missing items, or deep cleaning required during or after your stay. AVEXA Stays reserves the right to charge your payment method on file for any damages, smoking fines, or violations of the house rules." />
        </li>
      </ul>

      <h2>7. Cancellation</h2>
      <p>
        Cancellations and refunds are governed by our{' '}
        <Link href="/cancellation">Cancellation Policy</Link>, which forms a
        binding part of these terms.
      </p>

      <h2>8. Liability</h2>
      <p>
        We provide the apartment as described and take reasonable care to keep it
        safe and accurate.
      </p>
      <p>
        To the extent permitted by law, we are not liable for indirect or
        consequential loss, or for circumstances beyond our reasonable control.
      </p>
      <p>Nothing in these terms limits liability that cannot be limited by law.</p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by Romanian law.</p>
      <p>
        Mandatory consumer-protection rights in your country of residence remain
        unaffected.
      </p>
      <p>
        Consumers may also use the EU Online Dispute Resolution platform at{' '}
        <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>

      <h2>10. Changes</h2>
      <p>We may update these terms from time to time.</p>
      <p>
        The version in force is the one published on this page at the time of
        your booking.
      </p>
    </LegalShell>
  );
}
