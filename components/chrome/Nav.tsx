'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { CurrencySwitcher } from '@/components/currency/CurrencySwitcher';
import { MiniSearchPill } from '@/components/search/HeaderSearch';
import { SearchPill } from '@/components/search/SearchPill';
import { useSearch, type SearchPanel } from '@/components/search/SearchContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOutClient } from '@/lib/auth/client';
import { cn } from '@/lib/cn';

const links = [
  { href: '/locations', label: 'Locations' },
  { href: '/member-benefits', label: 'Member Benefits' },
  { href: '/my-trips', label: 'My Trips' },
];

/**
 * Airbnb-style permanent header: always visible (never hides on scroll).
 * On search pages (/ and /locations, desktop) it has two states —
 * big at the very top (full Where/When/Guests pill in a second row) and
 * compact once scrolled (mini pill in the nav centre). Clicking the mini
 * pill expands the header back to the big state over a dimmed page.
 * Nav links live in an Airbnb-style hamburger dropdown on the right.
 */
export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  // On the homepage + locations page, the mobile MobileSearchHeader replaces
  // this nav below md — the same breakpoint where this nav's search pills
  // start existing, so no viewport width is ever left without a search UI.
  const isSearchPage = pathname === '/' || pathname === '/locations';

  const { scrollY, pinned } = useChromeScroll();
  const { openPanel } = useSearch();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Set while the user re-expanded the search from the scrolled mini pill.
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const atTop = scrollY < 40;
  const big = isSearchPage && (atTop || searchExpanded);
  const transparent = isHome && !pinned;

  const collapse = useCallback(() => setSearchExpanded(false), []);

  const expandTo = useCallback(
    (section: SearchPanel) => {
      setSearchExpanded(true);
      // The big SearchPill is always mounted, so open its popup directly.
      openPanel(section, 'header');
    },
    [openPanel],
  );

  // Close the account menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // While click-expanded: Escape collapses and background scroll is locked.
  useEffect(() => {
    if (!searchExpanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') collapse();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [searchExpanded, collapse]);

  const loggedIn = !!user;
  const fullName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '';
  const displayName = fullName || user?.email || 'Guest';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';

  function logout() {
    // AuthProvider's onAuthStateChange clears the useAuth() context for us.
    void signOutClient();
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-300 ease-[var(--ease-snap)]',
          transparent ? 'bg-transparent' : 'border-b border-gray-line bg-cream/95 backdrop-blur',
          isSearchPage && 'max-md:hidden',
        )}
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-7">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-300',
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

            {/* Centre — mini pill once scrolled (search pages only) */}
            <div className="hidden min-w-0 flex-1 items-center justify-center px-6 md:flex">
              {isSearchPage && (
                <div
                  className={cn(
                    'min-w-0 transition-all duration-300 ease-[var(--ease-snap)]',
                    big ? 'pointer-events-none scale-95 opacity-0' : 'scale-100 opacity-100',
                  )}
                >
                  <MiniSearchPill onSelect={expandTo} />
                </div>
              )}
            </div>

            {/* Right — currency + Airbnb-style hamburger menu */}
            <div className="hidden items-center gap-3 md:flex">
              <CurrencySwitcher tone={transparent ? 'dark' : 'light'} />

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-full border py-1.5 pl-3.5 pr-1.5 transition',
                    transparent
                      ? 'border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20'
                      : 'border-gray-line bg-white text-ink shadow-[var(--shadow-pill)] hover:shadow-md',
                  )}
                >
                  <Icon name="menu" size={16} />
                  {loading ? (
                    <span aria-hidden className="size-7 animate-pulse rounded-full bg-ink/10" />
                  ) : loggedIn ? (
                    <span className="grid size-7 place-items-center rounded-full bg-gold font-display text-[13px] text-ink">
                      {initial}
                    </span>
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-ink text-cream">
                      <Icon name="user" size={14} />
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[120%] w-60 overflow-hidden rounded-2xl border border-gray-line bg-white py-2 text-ink shadow-[var(--shadow-pill)]">
                    {loggedIn ? (
                      <div className="border-b border-gray-line px-4 py-2.5">
                        <p className="text-sm font-semibold text-ink">{displayName}</p>
                        {user?.email && (
                          <p className="truncate text-xs text-ink-60">{user.email}</p>
                        )}
                      </div>
                    ) : (
                      <div className="border-b border-gray-line pb-2">
                        <MenuItem href="/login" bold onClick={() => setMenuOpen(false)}>
                          Sign up
                        </MenuItem>
                        <MenuItem href="/login" onClick={() => setMenuOpen(false)}>
                          Log in
                        </MenuItem>
                      </div>
                    )}

                    {links.map((link) => (
                      <MenuItem key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                        {link.label}
                      </MenuItem>
                    ))}

                    {loggedIn && (
                      <div className="mt-1 border-t border-gray-line pt-1">
                        <MenuItem href="/profile" onClick={() => setMenuOpen(false)}>
                          My Profile
                        </MenuItem>
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center px-4 py-2.5 text-left text-sm text-ink transition hover:bg-cream"
                        >
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className={cn('rounded-full p-2 md:hidden', transparent ? 'text-white' : 'text-ink')}
            >
              <Icon name="menu" size={24} />
            </button>
          </div>

          {/* Row 2 — big search pill (top of page, or re-expanded from the mini pill).
              No overflow-hidden: the pill's popups render below the header. */}
          {isSearchPage && (
            <div
              className={cn(
                'hidden justify-center transition-all duration-300 ease-[var(--ease-snap)] md:flex',
                big ? 'h-[86px] opacity-100' : 'pointer-events-none h-0 opacity-0',
              )}
            >
              <SearchPill
                pillId="header"
                variant="compact"
                className="max-w-[820px]"
                onSearch={collapse}
              />
            </div>
          )}
        </div>
      </header>

      {/* Dim overlay while the search is click-expanded from the mini pill */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {searchExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                onClick={collapse}
                className="fixed inset-0 z-40 bg-ink/30"
                aria-hidden
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

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
          <div className="flex items-center gap-3">
            <CurrencySwitcher tone="dark" />
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-full p-2">
              <Icon name="x" size={24} />
            </button>
          </div>
        </div>
        <nav className="flex flex-col gap-7 px-8 pt-10 font-display text-4xl">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                My Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="mt-6 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-6 inline-flex w-fit rounded-full bg-gold px-8 py-4 text-2xl text-ink"
            >
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}

function MenuItem({
  href,
  bold,
  onClick,
  children,
}: {
  href: string;
  bold?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center px-4 py-2.5 text-sm text-ink transition hover:bg-cream',
        bold && 'font-semibold',
      )}
    >
      {children}
    </Link>
  );
}
