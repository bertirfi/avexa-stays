'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { clearUser, readUser, writeUser, type StoredUser } from '@/lib/booking';
import { PersonalDetailsCard } from '@/components/profile/PersonalDetailsCard';
import { ToggleRow } from '@/components/profile/ToggleRow';

const PHONE_KEY = 'avexa_phone';

function readPhone(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(PHONE_KEY) || '';
  } catch {
    return '';
  }
}

function writePhone(value: string) {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(PHONE_KEY, value);
    else window.localStorage.removeItem(PHONE_KEY);
  } catch {}
}

/** Split a stored user into first / last name, handling the legacy combined `name`. */
function splitName(user: StoredUser): { first: string; last: string; full: string } {
  const first = user.firstName ?? '';
  const last = user.lastName ?? '';
  if (first || last) {
    return { first, last, full: `${first} ${last}`.trim() };
  }
  const parts = (user.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || '',
    last: parts.slice(1).join(' '),
    full: (user.name || '').trim(),
  };
}

export function ProfileApp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [phone, setPhone] = useState('');

  // Preferences (local UI state — demo only)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(readUser());
    setPhone(readPhone());
  }, []);

  if (!mounted) {
    return (
      <div className="bg-cream pt-40">
        <div className="mx-auto h-12 w-full max-w-[720px] animate-pulse rounded-full bg-gray-light" />
      </div>
    );
  }

  if (!user?.loggedIn) return <AuthGate />;

  const { first, last, full } = splitName(user);
  const displayName = full || 'Your Profile';
  const initial = (full || user.email || 'U').charAt(0).toUpperCase();

  function handleSave(next: { first: string; last: string; phone: string }) {
    if (!user) return;
    const nextFull = `${next.first} ${next.last}`.trim();
    const updated: StoredUser = {
      ...user,
      firstName: next.first,
      lastName: next.last,
      name: nextFull || user.name,
    };
    writeUser(updated);
    writePhone(next.phone);
    setUser(updated);
    setPhone(next.phone);
  }

  function handleLogout() {
    clearUser();
    router.push('/');
  }

  return (
    <div className="min-h-[calc(100vh-68px)] bg-cream px-4 pt-7 pb-15 min-[641px]:px-5 min-[641px]:pt-10 min-[641px]:pb-20 min-[981px]:px-6 min-[981px]:pt-14 min-[981px]:pb-25">
      <div className="mx-auto max-w-[720px]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3.5 sm:mb-11 sm:gap-5">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-gold font-display text-xl text-ink sm:size-16 sm:text-[26px]">
            {initial}
          </div>
          <div>
            <h1 className="font-display text-2xl leading-[1.1] tracking-[-0.02em] text-ink sm:text-[clamp(28px,5vw,36px)]">
              {displayName}
            </h1>
            <p className="font-mono-label mt-1 text-gold-dark">AVEXA Member</p>
          </div>
        </div>

        {/* Personal details */}
        <PersonalDetailsCard
          firstName={first}
          lastName={last}
          email={user.email ?? ''}
          phone={phone}
          onSave={handleSave}
        />

        {/* Manage stays */}
        <section className="mb-4 rounded-2xl border border-gray-line bg-white px-5 py-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono-label text-ink-60">Manage stays</h2>
          </div>
          <p className="mb-5 max-w-[520px] text-sm leading-[1.65] text-ink-80">
            Booked through Airbnb, Booking.com, or another platform? Link the reservation to your AVEXA
            profile to manage everything in one place.
          </p>
          <Link
            href="/my-trips"
            className="ease-[var(--ease-snap)] inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Add a reservation →
          </Link>
        </section>

        {/* Preferences */}
        <section className="mb-4 rounded-2xl border border-gray-line bg-white px-5 py-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono-label text-ink-60">Preferences</h2>
          </div>
          <ToggleRow
            label="Email notifications"
            description="Booking confirmations, reminders, and member offers"
            checked={emailNotifications}
            onChange={setEmailNotifications}
            first
          />
          <ToggleRow
            label="Marketing updates"
            description="New locations, seasonal promotions, partner deals"
            checked={marketing}
            onChange={setMarketing}
            last
          />
        </section>

        {/* Account */}
        <section className="rounded-2xl border border-gray-line bg-white px-5 py-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono-label text-ink-60">Account</h2>
          </div>
          <div className="mb-5">
            <button
              type="button"
              onClick={handleLogout}
              className="ease-[var(--ease-snap)] inline-flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Log out
            </button>
          </div>
          <p className="text-[13px] text-ink-60">
            Need to close your account?{' '}
            <a
              href="#"
              className="font-semibold text-ink underline underline-offset-[3px] transition-colors hover:text-[#FF4136]"
            >
              Delete account
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── Sign-in gate (mirrors checkout AuthGate) ─────────────────────── */

function AuthGate() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-2xl bg-gold-pale">
        <Icon name="user" size={32} className="text-gold-dark" />
      </div>
      <h2 className="font-display text-3xl">Sign in to view your profile</h2>
      <p className="mt-3 text-ink-80">
        Log in or create a free account to manage your personal details, stays, and preferences.
      </p>
      <Link
        href="/login?next=/profile"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Log in or sign up →
      </Link>
    </div>
  );
}
