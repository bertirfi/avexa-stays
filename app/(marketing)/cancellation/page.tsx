import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CANCELLATION_POLICY } from '@/lib/policies';

export const metadata: Metadata = {
  title: 'Cancellation & Modification Policy',
  description:
    'Cancellation rules for Avexa Stays bookings — the flexible member refund grid, non-member terms, city tax refunds, early departures, and refund processing.',
  alternates: { canonical: '/cancellation' },
};

export default function CancellationPage() {
  return (
    <LegalShell
      title="Cancellation & Modification Policy"
      updated="23 August 2026"
      intro="AVEXIAN members get flexible cancellation by right. Here is exactly how it works."
    >
      <h2>1. Members — flexible by right</h2>
      <p>Free AVEXA membership unlocks the following cancellation grid on every booking:</p>
      <div className="my-6 grid gap-px overflow-hidden rounded-xl border border-gray-line bg-gray-line md:grid-cols-3">
        {CANCELLATION_POLICY.memberTiers.map((line) => (
          <div key={line} className="bg-cream px-5 py-4">
            <p className="mb-0 text-[15px] leading-[1.5] text-ink-80">{line}</p>
          </div>
        ))}
      </div>
      <p>
        <strong>Payment:</strong> We may pre-authorize your credit card before
        arrival to guarantee your booking.
      </p>

      <h2>2. Non-member bookings</h2>
      <p>{CANCELLATION_POLICY.nonMember}</p>
      <p>
        Online booking currently requires a free AVEXA membership account, so
        this applies to bookings made without membership once guest checkout
        opens.
      </p>

      <h2>3. City tax</h2>
      <p>{CANCELLATION_POLICY.cityTax}</p>

      <h2>4. Early departures</h2>
      <p>
        If you leave before your scheduled check-out date, the remaining nights
        are not refunded.
      </p>

      <h2>5. Refund processing</h2>
      <p>
        Eligible refunds are returned to your original payment method.
      </p>
      <p>
        Please allow 5–10 business days for the funds to appear, depending on
        your bank.
      </p>
    </LegalShell>
  );
}
