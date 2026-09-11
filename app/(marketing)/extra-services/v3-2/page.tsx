import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { ExtraServicesV3_2 } from '@/content/legal/extra-services-v3-2';

export const metadata: Metadata = {
  title: 'Extra Services & Tariffs — v3.2',
  description: 'Everything you can add to your stay, and what it costs — AVEXA Stays Extra Services & Tariffs, AVX-08 v3.2, in force 1 September 2026.',
  robots: { index: false },
};

export default function ExtraServicesVersionedPage() {
  return (
    <LegalShell title="Extra Services & Tariffs" code="AVX-08" version="3.2" inForce="1 September 2026">
      <ExtraServicesV3_2 />
    </LegalShell>
  );
}
