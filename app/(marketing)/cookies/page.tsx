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
      updated="25 August 2026"
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

      <h2>Your choice</h2>
      <p>
        On your first visit, a banner lets you accept all cookies or keep only
        the essential ones.
      </p>
      <p>
        Your choice is saved in a first-party cookie named avexa_consent for 6
        months, then we ask again.
      </p>
      <p>
        You can change your mind at any time via “Cookie preferences” in the
        footer of every page — changes take effect immediately.
      </p>

      <h2>Essential cookies we set</h2>
      <p>
        When you sign in to your Avexa account, Supabase — our authentication
        provider — sets session cookies (names starting with “sb-”).
      </p>
      <p>
        These keep you securely signed in to “My Trips” and your profile, and
        expire when your session ends.
      </p>
      <p>
        The avexa_consent cookie that records your cookie choice is also
        essential.
      </p>
      <p>
        They are strictly necessary: without them, member features cannot work.
      </p>
      <p>We set no advertising or cross-site tracking cookies.</p>

      <h2>Local storage we use</h2>
      <p>
        For convenience, we keep your search preferences (avexa_search), your
        display currency (avexa_currency) and any in-progress booking draft
        (avexa_booking) in your browser’s local storage.
      </p>
      <p>
        Local storage is not a cookie — it stays on your device and is not sent
        to our servers with each request.
      </p>
      <p>You can clear it at any time from your browser settings.</p>

      <h2>Google Maps</h2>
      <p>
        The interactive map on our locations page and on each apartment’s page
        is provided by Google Maps and loads with the page.
      </p>
      <p>
        Google may set its own cookies when the map loads — see the{' '}
        <a
          href="https://policies.google.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google Privacy Policy
        </a>
        .
      </p>

      <h2>Analytics — not yet active</h2>
      <p>We do not currently use any analytics cookies.</p>
      <p>
        If we introduce analytics in the future, those cookies will only be set
        after you give your consent, and this policy will be updated first.
      </p>

      <h2>Payments</h2>
      <p>
        Payments happen on Stripe’s secure checkout at stripe.com — nothing
        from Stripe loads on our site.
      </p>
      <p>
        Stripe’s own page sets the cookies it needs to process your payment —
        see the{' '}
        <a
          href="https://stripe.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Stripe Privacy Policy
        </a>
        .
      </p>

      <h2>Managing cookies</h2>
      <p>
        Use “Cookie preferences” in the footer to review or change your choice
        at any time.
      </p>
      <p>
        You can also block or delete cookies at any time in your browser
        settings.
      </p>
      <p>
        Blocking the essential cookies will sign you out and disable member
        features.
      </p>

      <h2>Contact</h2>
      <p>
        <span className="block">Questions about cookies or your data?</span>
        <span className="block">
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </span>
      </p>
      <p>
        For the full picture of how we handle personal data, see our{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
