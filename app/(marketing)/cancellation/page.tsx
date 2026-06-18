import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description:
    'How cancellations, refunds, and no-shows work for AVEXA Stays bookings, including member free cancellation.',
  alternates: { canonical: '/cancellation' },
};

export default function CancellationPage() {
  return (
    <LegalShell
      title="Cancellation Policy"
      updated="17 June 2026"
      intro="How cancellations and refunds work, depending on the rate you booked. This policy forms part of our Terms & Conditions."
    >
      <h2>Member Flex rate</h2>
      <p>
        On the flexible member rate, you can cancel at no cost right up to the day
        of arrival. If you cancel on the arrival date itself, a charge equal to
        one night applies. Everything beyond that first night is refunded.
      </p>

      <h2>Saver rate</h2>
      <p>
        The Saver rate is offered at a lower price in exchange for being
        non-refundable. If you cancel a Saver booking, the amount paid is not
        refunded. Choose the Member Flex rate if you need flexibility.
      </p>

      <h2>No-show</h2>
      <p>
        If you do not arrive and have not cancelled, the booking is treated as a
        no-show and is charged in full.
      </p>

      <h2>How to cancel</h2>
      <p>
        Cancel from your{' '}
        <Link href="/my-trips">My Trips</Link> page, or email{' '}
        <a href="mailto:hello@avexastays.com">hello@avexastays.com</a> with your
        booking reference. The cancellation takes effect when we receive it.
      </p>

      <h2>Refunds</h2>
      <p>
        Eligible refunds are returned to your original payment method, normally
        within 5–10 business days depending on your bank or card issuer.
      </p>

      <h2>Changes to your dates</h2>
      <p>
        Need different dates rather than a cancellation? Contact us — date changes
        are subject to availability and any difference in price, and we will
        always try to help.
      </p>

      <h2>Exceptional circumstances</h2>
      <p>
        In cases of force majeure or other exceptional events beyond your control,
        contact us directly. We assess these situations fairly and on a
        case-by-case basis. Your statutory consumer rights remain unaffected. See
        our <Link href="/terms">Terms &amp; Conditions</Link> for more.
      </p>
    </LegalShell>
  );
}
