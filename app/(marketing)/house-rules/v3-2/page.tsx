import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { HouseRulesV32 } from '@/content/legal/house-rules-v3-2';

export const metadata: Metadata = {
  title: 'House Rules & Local Guidelines — v3.2',
  description: 'Six rules. All of them exist for a reason.',
  alternates: { canonical: '/house-rules/v3-2' },
  robots: { index: false },
};

export default function HouseRulesV3_2Page() {
  return (
    <LegalShell
      title="House Rules & Local Guidelines"
      code="AVX-04"
      version="3.2"
      inForce="1 September 2026"
      intro="Six rules. All of them exist for a reason."
    >
      <HouseRulesV32 />
    </LegalShell>
  );
}
