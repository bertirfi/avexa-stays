import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { PrivacyPolicyV3_2 } from '@/content/legal/privacy-v3-2';

export const metadata: Metadata = {
  title: 'Privacy Policy — v3.2',
  description: 'How we handle your personal data — AVEXA Stays Privacy Policy, AVX-06 v3.2, in force 1 September 2026.',
  robots: { index: false },
};

export default function PrivacyPolicyVersionedPage() {
  return (
    <LegalShell title="Privacy Policy" code="AVX-06" version="3.2" inForce="1 September 2026">
      <PrivacyPolicyV3_2 />
    </LegalShell>
  );
}
