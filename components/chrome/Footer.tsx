import type { ReactNode } from 'react';
import Link from 'next/link';
import { NewsletterForm } from '@/components/chrome/NewsletterForm';
import { Logo } from '@/components/chrome/Logo';
import { CONTACT_EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact';

const contactLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Chat on WhatsApp', href: WHATSAPP_URL },
  { label: `Call ${PHONE_DISPLAY}`, href: PHONE_TEL },
  { label: 'Contact us', href: `mailto:${CONTACT_EMAIL}` },
  { label: 'Cancellation policy', href: '/cancellation' },
];

const discoverLinks = [
  { label: 'All locations', href: '/locations' },
  { label: 'Bucharest guide', href: '/guide' },
  { label: 'Member benefits', href: '/member-benefits' },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/avexastays',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 5 5 .06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.2 3.3-1.7 4.8-5 5-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-3.3-.2-4.8-1.7-5-5C2.07 15.6 2 15.2 2 12s0-3.6.07-4.9c.2-3.3 1.7-4.8 5-5C8.4 2.07 8.8 2.07 12 2.07zm0 3.3a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 10.7a4.2 4.2 0 110-8.4 4.2 4.2 0 010 8.4zm6.7-10.9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@avexastays',
    path: 'M19.3 6.2a4.8 4.8 0 01-3-1.1 4.8 4.8 0 01-1.5-2.6h-3.2v12.6a2.7 2.7 0 11-2-2.6V9.2a5.9 5.9 0 105.3 5.9V9.5a8 8 0 004.4 1.3V7.6a4.8 4.8 0 01-0-1.4z',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/avexastays',
    path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/avexa',
    path: 'M4.98 3.5a2.5 2.5 0 11.02 5 2.5 2.5 0 01-.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05 4 0 4.75 2.64 4.75 6.07V21h-4v-5.37c0-1.28-.02-2.92-1.78-2.92-1.79 0-2.07 1.4-2.07 2.83V21h-4V9z',
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        {/* Top columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          <Column title="Contact & Help" links={contactLinks} />
          <Column title="Discover" links={discoverLinks} />

          {/* Stay social + pay-with */}
          <div>
            <h4 className="font-mono-label mb-5 text-gold">Stay social</h4>
            <ul className="flex gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-9 place-items-center rounded-full border border-cream/15 transition hover:border-gold hover:text-gold"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="font-mono-label mb-3 mt-8 text-gold">Pay with</h4>
            <ul className="flex flex-wrap gap-2">
              {['PayPal', 'Apple Pay', 'G Pay', 'Mastercard', 'VISA'].map((p) => (
                <li
                  key={p}
                  className="rounded-md border border-cream/15 px-2 py-1 text-[11px] font-medium text-cream/80"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 grid items-end gap-10 border-t border-cream/10 pt-12 md:grid-cols-2">
          <div>
            <Logo size={56} wordmarkSize={28} className="mb-5" />
            <p className="font-display text-2xl leading-tight text-cream/85">
              No front desk.
              <br />
              No friction.
              <br />
              No compromise.
            </p>
          </div>
          <div>
            <h3 className="font-display text-3xl md:text-4xl">
              Stay close,&nbsp;
              <em className="not-italic text-gold">travel often.</em>
            </h3>
            <div className="mt-6">
              <NewsletterForm />
            </div>
            <p className="mt-4 text-xs text-cream/60">
              By subscribing, you agree to receive promotional emails from AVEXA. We&apos;ll use your data in
              accordance with our{' '}
              <Link href="/privacy" className="underline hover:text-gold">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="underline hover:text-gold">
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Bottom: legal */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-sm text-cream/60 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} AVEXA Stays · Bucharest</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gold">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/imprint" className="hover:text-gold">Imprint</Link>
          </div>
        </div>
      </div>

      {/* Giant AVEXA watermark — centered, tucked into the bottom edge.
          Visible on mobile too (scales to fill the width); desktop unchanged. */}
      <div
        aria-hidden
        className="font-display mb-16 mt-6 block select-none overflow-hidden text-center text-[24vw] leading-[0.78] tracking-[-0.04em] text-cream/10 sm:mb-[-20px] sm:mt-10 sm:text-[clamp(80px,18vw,280px)]"
      >
        AVEXA
      </div>
    </footer>
  );
}

/** Renders internal routes via <Link>, and tel:/mailto:/http links via <a>. */
function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const isProtocol = /^(https?:|mailto:|tel:)/.test(href);
  if (isProtocol) {
    const isHttp = href.startsWith('http');
    return (
      <a
        href={href}
        className={className}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Column({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="font-mono-label mb-5 text-gold">{title}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <FooterLink
              href={l.href}
              className="text-[15px] text-cream/80 transition hover:text-gold"
            >
              {l.label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
