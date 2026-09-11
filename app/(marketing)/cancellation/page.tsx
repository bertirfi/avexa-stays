import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CancellationV32 } from '@/content/legal/cancellation-v3-2';

export const metadata: Metadata = {
  title: 'Cancellation & Modification Policy',
  description: 'Direct bookings and platform bookings, clearly separated.',
  alternates: { canonical: '/cancellation' },
};

export default function CancellationPage() {
  return (
    <LegalShell
      title="Cancellation & Modification Policy"
      code="AVX-02"
      version="3.2"
      inForce="1 September 2026"
      intro="Direct bookings and platform bookings, clearly separated."
    >
      <CancellationV32 />
    </LegalShell>
  );
}
