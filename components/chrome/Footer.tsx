import type { ReactNode } from 'react';
import Link from 'next/link';
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

// Social links removed 24.08 (client review): none of the accounts exist yet —
// Instagram/TikTok/Facebook @avexastays are unregistered and
// linkedin.com/company/avexa belongs to an unrelated company.
// Re-add the "Stay social" icon list here once real profiles are created.

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        {/* Top columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          <Column title="Contact & Help" links={contactLinks} />
          <Column title="Discover" links={discoverLinks} />

          {/* Pay-with */}
          <div>
            <h4 className="font-mono-label mb-3 text-gold">Pay with</h4>
            <ul className="flex flex-wrap gap-2">
              {['VISA', 'Mastercard', 'AMEX', 'Apple Pay', 'G Pay'].map((p) => (
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

        {/* Brand statement.
            Newsletter form hidden until Brevo double opt-in ships — client decision 24.08.
            The /api/newsletter route and NewsletterForm component stay intact; restore
            <NewsletterForm /> (+ the subscribe consent copy) here when it launches. */}
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
          </div>
        </div>

        {/* Bottom: legal */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-sm text-cream/60 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} AVEXA Stays · Bucharest</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gold">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-gold">Cookie Policy</Link>
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
