import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Cancellation & Modification Policy',
  description:
    'Flexible and Non-Refundable rate rules for Avexa Stays bookings — free cancellation windows, no-show charges, early departures, and refunds.',
  alternates: { canonical: '/cancellation' },
};

export default function CancellationPage() {
  return (
    <LegalShell
      title="Cancellation & Modification Policy"
      updated="28 July 2026"
      intro="We want to give you the flexibility you need while ensuring our properties are ready for your stay. When booking your Avexa apartment, you can choose between two rate plans."
    >
      <h2>1. Flexible Rate (Standard)</h2>
      <p>
        <strong>Free Cancellation:</strong> Cancel or modify free of charge up
        to 48 hours before your scheduled arrival date (by 3:00 PM, local time).
      </p>
      <p>
        <strong>Late Cancellation:</strong> If you cancel within 48 hours of
        arrival, or in case of a no-show, the total price of the reservation
        will be charged.
      </p>
      <p>
        <strong>Payment:</strong> We may pre-authorize your credit card before
        arrival to guarantee your booking.
      </p>

      <h2>2. Non-Refundable Rate (Discounted)</h2>
      <p>
        This rate locks in our best price but is strictly non-refundable.
      </p>
      <p>
        In case of cancellation, date modification, or no-show, no refunds will
        be issued.
      </p>
      <p>
        <strong>Payment:</strong> The total amount is charged automatically at
        the time of booking.
      </p>

      <h2>3. Early Departures</h2>
      <p>
        If you leave before your scheduled check-out date, the remaining nights
        are not refunded.
      </p>

      <h2>4. Refund Processing</h2>
      <p>
        Eligible refunds under the Flexible Rate are returned to your original
        payment method.
      </p>
      <p>
        Please allow 5–10 business days for the funds to appear, depending on
        your bank.
      </p>
    </LegalShell>
  );
}
