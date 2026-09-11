import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { HouseRulesV32 } from '@/content/legal/house-rules-v3-2';

export const metadata: Metadata = {
  title: 'House Rules & Local Guidelines',
  description: 'Six rules. All of them exist for a reason.',
  alternates: { canonical: '/house-rules' },
};

export default function HouseRulesPage() {
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
