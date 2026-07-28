import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalShell } from '@/components/legal/LegalShell';
import { CONTACT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'The cookies and local storage Avexa Stays uses — essential sign-in cookies only, no advertising cookies, and consent-first analytics if introduced.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      updated="28 July 2026"
      intro="We keep this simple. Avexa Stays sets only the cookies it needs to work — nothing for advertising, and nothing that tracks you across the web."
    >
      <h2>What cookies are</h2>
      <p>
        Cookies are small text files that a website stores on your device
        through your browser.
      </p>
      <p>
        They let a site remember you between pages and visits — for example,
        keeping you signed in.
      </p>

      <h2>Essential cookies we set</h2>
      <p>
        When you sign in to your Avexa account, Supabase — our authentication
        provider — sets session cookies.
      </p>
      <p>
        These keep you securely signed in to “My Trips” and your profile, and
        expire when your session ends.
      </p>
      <p>
        They are strictly necessary: without them, member features cannot work.
      </p>
      <p>We set no advertising or cross-site tracking cookies.</p>

      <h2>Local storage we use</h2>
      <p>
        For convenience, we keep your search preferences and any in-progress
        booking draft in your browser’s local storage.
      </p>
      <p>
        Local storage is not a cookie — it stays on your device and is not sent
        to our servers with each request.
      </p>
      <p>You can clear it at any time from your browser settings.</p>

      <h2>Analytics — not yet active</h2>
      <p>We do not currently use any analytics cookies.</p>
      <p>
        If we introduce analytics in the future, those cookies will only be set
        after you give your consent, and this policy will be updated first.
      </p>

      <h2>Third-party services</h2>
      <p>
        Payments happen on Stripe’s secure checkout at stripe.com, which sets
        its own cookies — see the{' '}
        <a
          href="https://stripe.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Stripe Privacy Policy
        </a>
        .
      </p>
      <p>
        The map on our locations page is provided by Google Maps, which may set
        its own cookies — see the{' '}
        <a
          href="https://policies.google.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Privacy Policy
        </a>
        .
      </p>

      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies at any time in your browser settings.
      </p>
      <p>
        Blocking the essential cookies will sign you out and disable member
        features.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies or your data? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>
        For the full picture of how we handle personal data, see our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
