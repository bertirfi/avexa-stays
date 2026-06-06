'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { cn } from '@/lib/cn';

const links = [
  { href: '/locations', label: 'Locations' },
  { href: '/member-benefits', label: 'Member Benefits' },
  { href: '/my-trips', label: 'My Trips' },
];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 32);
      // Hide on scroll down (past the hero), show on scroll up
      if (y > 160 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Transparent only over the homepage hero, before scrolling
  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background,border-color,padding] duration-300 ease-[var(--ease-snap)]',
          transparent ? 'bg-transparent' : 'border-b border-gray-line bg-cream/95 backdrop-blur',
          hidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-[1400px] items-center justify-between px-6 transition-all duration-300 md:px-7',
            transparent ? 'py-5' : 'py-2.5',
          )}
        >
          <Link href="/" aria-label="AVEXA home">
            <Logo
              size={transparent ? 64 : 48}
              wordmarkSize={transparent ? 32 : 30}
              tone={transparent ? 'gold' : 'gold-dark'}
              className="transition-all"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const current = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-[13.5px] font-medium transition-colors',
                    transparent
                      ? 'text-white/80 hover:text-gold'
                      : current
                        ? 'text-gold-dark'
                        : 'text-ink/80 hover:text-ink',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className={cn(
                'rounded-full px-5 py-2 text-[13.5px] font-semibold transition',
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
            className={cn('rounded-full p-2 md:hidden', transparent ? 'text-white' : 'text-ink')}
          >
            <Icon name="menu" size={24} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-ink text-cream transition-transform duration-500 ease-[var(--ease-snap)] md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Logo size={44} wordmarkSize={22} />
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-full p-2">
            <Icon name="x" size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-7 px-8 pt-10 font-display text-4xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-6 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </>
  );
}
