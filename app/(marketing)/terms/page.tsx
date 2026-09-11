import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { TermsV32 } from '@/content/legal/terms-v3-2';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The agreement between you and AVEXA Stays.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      code="AVX-01"
      version="3.2"
      inForce="1 September 2026"
      intro="The agreement between you and AVEXA Stays."
    >
      <TermsV32 />
    </LegalShell>
  );
}
