import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { AvexianClubTermsV32 } from '@/content/legal/avexian-club-terms-v3-2';

export const metadata: Metadata = {
  title: 'AVEXIAN Club — Programme Terms — v3.2',
  description: 'AVX Coins: how you earn them, spend them, and when they expire.',
  alternates: { canonical: '/avexian-club-terms/v3-2' },
  robots: { index: false },
};

export default function AvexianClubTermsV3_2Page() {
  return (
    <LegalShell
      title="AVEXIAN Club — Programme Terms"
      code="AVX-11"
      version="3.2"
      inForce="1 September 2026"
      intro="AVX Coins: how you earn them, spend them, and when they expire."
    >
      <AvexianClubTermsV32 />
    </LegalShell>
  );
}
