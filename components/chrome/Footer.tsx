import Link from 'next/link';
import { NewsletterForm } from '@/components/chrome/NewsletterForm';

const cols = [
  {
    title: 'Contact & Help',
    links: [
      { label: 'Contact us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Help center', href: '/help' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Locations', href: '/locations' },
      { label: 'Member Benefits', href: '/member-benefits' },
      { label: 'Long stays', href: '/long-stays' },
      { label: 'Gift cards', href: '/gift' },
    ],
  },
  {
    title: 'AVEXA',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
      { label: 'Owners', href: '/owners' },
    ],
  },
  {
    title: 'Stay social',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/avexastays' },
      { label: 'LinkedIn', href: 'https://linkedin.com/company/avexa' },
      { label: 'Newsletter', href: '#newsletter' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10">
        {/* Columns */}
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono-label mb-5 text-gold">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-cream/80 transition hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div
          id="newsletter"
          className="mt-20 grid items-end gap-8 border-t border-cream/10 pt-12 md:grid-cols-2"
        >
          <div>
            <h3 className="font-display text-3xl">Get city dispatches.</h3>
            <p className="mt-2 text-cream/70">
              Quarterly notes from Bucharest: new openings, residencies, member-only stays.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Bottom: giant wordmark + legal */}
        <div className="mt-20 overflow-hidden">
          <div
            aria-hidden
            className="font-display text-cream/8 select-none"
            style={{ fontSize: 'clamp(120px, 22vw, 320px)', lineHeight: 0.85 }}
          >
            AVEXA
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-sm text-cream/60 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} AVEXA Stays · Bucharest</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gold">Terms</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
            <Link href="/imprint" className="hover:text-gold">Imprint</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
