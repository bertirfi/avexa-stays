import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CookiePolicyV3_3 } from '@/content/legal/cookies-v3-3';
import { CookiePreferencesLink } from '@/components/consent/CookiePreferencesLink';

export const metadata: Metadata = {
  title: 'Cookie Policy — v3.3',
  description: 'The cookies and local storage avexastays.com actually uses — AVX-07 v3.3, in force 14 September 2026.',
  robots: { index: false },
};

export default function CookiePolicyVersionedPage() {
  return (
    <LegalShell title="Cookie Policy" code="AVX-07" version="3.3" inForce="14 September 2026">
      <CookiePolicyV3_3 />
      <p className="mt-8">
        <CookiePreferencesLink className="font-semibold text-gold-dark underline underline-offset-2" />
      </p>
    </LegalShell>
  );
}
