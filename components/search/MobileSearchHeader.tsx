'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOutClient } from '@/lib/auth/client';
import { cn } from '@/lib/cn';

const links = [
  { href: '/locations', label: 'Locations' },
  { href: '/member-benefits', label: 'Member Benefits' },
  { href: '/my-trips', label: 'My Trips' },
];

/**
 * Mobile sticky search header (<md) for the homepage + locations page.
 * Row 1 (logo + hamburger) stays; the "Start your search" pill collapses on
 * scroll down and returns on scroll up. Tapping it opens the Airbnb-style
 * full-screen search overlay. From md up this renders nothing — the desktop
 * Nav's search pills exist only from md, so the boundary MUST be md on both
 * sides: an sm boundary here once left 640–767px viewports (unfolded
 * foldables, small tablets) with no search UI at all.
 */
export function MobileSearchHeader() {
  const pathname = usePathname();
  const isSearchPage = pathname === '/' || pathname === '/locations';

  const { user } = useAuth();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Single source of truth for scroll direction (jitter-hardened in the
  // provider) — a local listener here once flickered out of sync with TabBar.
  const { scrollingDown: collapsed } = useChromeScroll();

  if (!isSearchPage) return null;

  const loggedIn = !!user;

  return (
    <>
      <header className="sticky top-0 z-[120] bg-cream px-4 pb-3 pt-2.5 md:hidden">
        {/* Row 1 — logo + hamburger */}
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="AVEXA home">
            <Logo size={34} wordmarkSize={20} tone="gold-dark" />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full text-ink"
          >
            <Icon name="menu" size={24} />
          </button>
        </div>

        {/* Row 2 — search pill (collapses on scroll down) */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-[var(--ease-snap)]',
            collapsed ? 'mt-0 max-h-0 opacity-0' : 'mt-2.5 max-h-16 opacity-100',
          )}
        >
          <button
            type="button"
            onClick={() => setOverlayOpen(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-gray-line bg-white px-5 py-[15px] text-[15px] font-semibold text-ink shadow-[0_6px_20px_rgba(25,25,25,0.08)]"
          >
            <Icon name="search" size={16} strokeWidth={2.2} />
            Start your search
          </button>
        </div>
      </header>

      {/* Slide-in menu */}
      <div
        className={cn(
          'fixed inset-0 z-[130] bg-ink text-cream transition-transform duration-500 ease-[var(--ease-snap)] md:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Logo size={40} wordmarkSize={22} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="rounded-full p-2"
          >
            <Icon name="x" size={24} />
          </button>
        </div>
        <nav className="flex flex-col gap-6 px-8 pt-8 font-display text-3xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  void signOutClient();
                  setMenuOpen(false);
                }}
                className="mt-4 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-4 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
            >
              Sign up
            </Link>
          )}
        </nav>
      </div>

      <MobileSearchOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </>
  );
}
