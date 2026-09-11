import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/contact';

/**
 * AVX-07 · PUB Cookie Policy · v3.2 · in force 1 September 2026.
 * Verbatim body — docx artefacts (cover lines, DOCUMENT CLASS box, page
 * footer) dropped when mounting; closing company block kept per source.
 */
export function CookiePolicyV3_2() {
  return (
    <>
      <p>
        We keep this simple. AVEXA Stays sets only the cookies it needs to work
        — nothing for advertising, and nothing that tracks you across the web.
      </p>

      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files that a website stores on your device
        through your browser. They let a site remember you between pages and
        visits — for example, keeping you signed in.
      </p>

      <h2>2. Your choice</h2>
      <p>On your first visit, a banner lets you accept all cookies or keep only the essential ones.</p>
      <p>
        Your choice is saved in a first-party cookie named avexa_consent for 6
        months, then we ask again.
      </p>
      <p>
        You can change your mind at any time via &ldquo;Cookie preferences&rdquo; in
        the footer of every page — changes take effect immediately.
      </p>

      <h2>3. Essential cookies we set</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sb-* (session cookies)</td>
              <td>Supabase (our authentication provider)</td>
              <td>Keep you securely signed in to My Trips and your profile</td>
              <td>Until the session ends</td>
            </tr>
            <tr>
              <td>avexa_consent</td>
              <td>AVEXA Stays (first-party)</td>
              <td>Records your cookie choice</td>
              <td>6 months</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        These are strictly necessary: without them, member features cannot
        work. We set no advertising or cross-site tracking cookies.
      </p>

      <h2>4. Local storage we use</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>avexa_search</td>
              <td>Your search preferences</td>
            </tr>
            <tr>
              <td>avexa_currency</td>
              <td>Your display currency</td>
            </tr>
            <tr>
              <td>avexa_booking</td>
              <td>Any in-progress booking draft</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Local storage is not a cookie — it stays on your device and is not
        sent to our servers with each request. You can clear it at any time
        from your browser settings.
      </p>

      <h2>5. Third parties</h2>
      <p>
        Google Maps: the interactive map on the locations page and on each
        apartment&rsquo;s page is provided by Google Maps and loads with the
        page. Google may set its own cookies when the map loads — see the{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy
        </a>
        .
      </p>
      <p>
        Stripe: payments happen on Stripe&rsquo;s secure checkout at
        stripe.com — nothing from Stripe loads on our site. Stripe&rsquo;s own
        page sets the cookies it needs to process your payment — see the{' '}
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
          Stripe Privacy Policy
        </a>
        .
      </p>

      <h2>6. Analytics — not yet active</h2>
      <p>
        We do not currently use any analytics cookies. If we introduce
        analytics in the future, those cookies will only be set after you give
        your consent, and this policy will be updated first.
      </p>

      <h2>7. Managing cookies</h2>
      <p>
        Use &ldquo;Cookie preferences&rdquo; in the footer to review or change
        your choice at any time. You can also block or delete cookies in your
        browser settings. Blocking the essential cookies will sign you out and
        disable member features.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about cookies or your data? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. For the full
        picture of how we handle personal data, see our{' '}
        <Link href="/privacy">Privacy Policy</Link> (AVX-06).
      </p>

      <p>
        AVEXA Stays is a trading name of Prime Gold Living SRL, Str. Fibrei 28,
        Sector 2, 020342 București, Romania. CUI RO52265361, Trade Register
        J2025057993006. Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, +40 721 347 642.
      </p>
    </>
  );
}
