import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { DamagePolicyV32 } from '@/content/legal/damage-policy-v3-2';

export const metadata: Metadata = {
  title: 'Damage & Penalties Policy',
  description: 'No deposit. Announced penalties, evidenced claims, a real right to dispute.',
  alternates: { canonical: '/damage-policy' },
};

export default function DamagePolicyPage() {
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
