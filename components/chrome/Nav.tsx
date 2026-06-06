'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { cn } from '@/lib/cn';

const links = [
  { href: '/locations', label: 'Locations' },
  { href: '/member-benefits', label: 'Member Benefits' },
  { href: '/my-trips', label: 'My Trips' },
];

interface NavProps {
  /** When true, nav floats over a dark hero (transparent) until the user scrolls. */
  overlay?: boolean;
}

export function Nav({ overlay = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = overlay && !scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          transparent
            ? 'bg-transparent'
            : 'bg-cream/95 backdrop-blur border-b border-gray-line',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" aria-label="AVEXA home">
            <Logo
              size={transparent ? 64 : 48}
              wordmarkSize={transparent ? 32 : 22}
              className="transition-all"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[17px] transition-colors',
                  transparent ? 'text-white hover:text-gold' : 'text-ink hover:text-gold-dark',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className={cn(
                'rounded-full px-5 py-2 text-[15px] font-semibold transition',
                transparent
                  ? 'bg-white text-ink hover:bg-gold'
                  : 'bg-ink text-cream hover:bg-gold hover:text-ink',
              )}
            >
              Sign up
            </Link>
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className={cn(
              'md:hidden rounded-full p-2',
              transparent ? 'text-white' : 'text-ink',
            )}
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-ink text-cream transition-transform duration-500 ease-[var(--ease-snap)] md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Logo size={48} wordmarkSize={22} />
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="rounded-full p-2"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-8 px-8 pt-12 font-display text-4xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-8 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </>
  );
}
