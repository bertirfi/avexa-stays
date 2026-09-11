import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { ImprintV32 } from '@/content/legal/imprint-v3-2';

export const metadata: Metadata = {
  title: 'Imprint / Legal Notice',
  description: 'Who operates this website.',
  alternates: { canonical: '/imprint' },
};

export default function ImprintPage() {
  return (
    <LegalShell
      title="Imprint / Legal Notice"
      code="AVX-10"
      version="3.2"
      inForce="1 September 2026"
      intro="Who operates this website."
    >
      <ImprintV32 />
    </LegalShell>
  );
}
