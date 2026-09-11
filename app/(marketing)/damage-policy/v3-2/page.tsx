import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { DamagePolicyV32 } from '@/content/legal/damage-policy-v3-2';

export const metadata: Metadata = {
  title: 'Damage & Penalties Policy — v3.2',
  description: 'No deposit. Announced penalties, evidenced claims, a real right to dispute.',
  alternates: { canonical: '/damage-policy/v3-2' },
  robots: { index: false },
};

export default function DamagePolicyV3_2Page() {
  return (
    <LegalShell
      title="Damage & Penalties Policy"
      code="AVX-03"
      version="3.2"
      inForce="1 September 2026"
      intro="No deposit. Announced penalties, evidenced claims, a real right to dispute."
    >
      <DamagePolicyV32 />
    </LegalShell>
  );
}
