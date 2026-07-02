'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { useChromeScroll } from '@/components/chrome/ChromeScrollProvider';
import { CurrencySwitcher } from '@/components/currency/CurrencySwitcher';
import { readUser, type StoredUser } from '@/lib/booking';
import { signOutClient } from '@/lib/auth/client';
import { cn } from '@/lib/cn';

const links = [
  { href: '/locations', label: 'Locations' },
  { href: '/member-benefits', label: 'Member Benefits' },
  { href: '/my-trips', label: 'My Trips' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  // On the homepage + locations page, the mobile MobileSearchHeader replaces
  // this nav (≤sm). Desktop and all other pages keep the normal nav.
  const isSearchPage = pathname === '/' || pathname === '/locations';

  const { pinned, navHidden } = useChromeScroll();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read auth on mount + react to the D-key demo toggle / cross-tab changes
  useEffect(() => {
    const sync = () => setUser(readUser());
    sync();
    window.addEventListener('avexa:auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('avexa:auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

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

  const transparent = isHome && !pinned;
  const loggedIn = !!user?.loggedIn;
  const displayName = user?.firstName || user?.name || user?.email || 'Guest';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'A';

  function logout() {
    void signOutClient();
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background,border-color,padding] duration-300 ease-[var(--ease-snap)]',
          transparent ? 'bg-transparent' : 'border-b border-gray-line bg-cream/95 backdrop-blur',
          navHidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0',
          isSearchPage && 'max-sm:hidden',
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

            <CurrencySwitcher tone={transparent ? 'dark' : 'light'} />

            {loggedIn ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  className="grid size-9 place-items-center rounded-full bg-gold font-display text-sm text-ink transition hover:bg-gold-dark hover:text-cream"
                >
                  {initial}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[120%] w-56 overflow-hidden rounded-2xl border border-gray-line bg-white py-2 shadow-[var(--shadow-pill)]">
                    <div className="border-b border-gray-line px-4 py-2.5">
                      <p className="text-sm font-semibold text-ink">{displayName}</p>
                      {user?.email && <p className="truncate text-xs text-ink-60">{user.email}</p>}
                    </div>
                    <MenuLink href="/my-trips" icon="calendar" onClick={() => setMenuOpen(false)}>
                      My Trips
                    </MenuLink>
                    <MenuLink href="/profile" icon="user" onClick={() => setMenuOpen(false)}>
                      My Profile
                    </MenuLink>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink transition hover:bg-cream"
                    >
                      <Icon name="x" size={16} className="text-ink-60" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}
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

function MenuLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: 'calendar' | 'user';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink transition hover:bg-cream"
    >
      <Icon name={icon} size={16} className="text-ink-60" />
      {children}
    </Link>
  );
}
