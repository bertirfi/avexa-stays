import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CookiePolicyV3_2 } from '@/content/legal/cookies-v3-2';
import { CookiePreferencesLink } from '@/components/consent/CookiePreferencesLink';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'The cookies and local storage avexastays.com actually uses — AVX-07 v3.2, in force 1 September 2026.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" code="AVX-07" version="3.2" inForce="1 September 2026">
      <CookiePolicyV3_2 />
      <p className="mt-8">
        <CookiePreferencesLink className="font-semibold text-gold-dark underline underline-offset-2" />
      </p>
    </LegalShell>
  );
}
