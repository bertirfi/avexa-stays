'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOutClient } from '@/lib/auth/client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { PersonalDetailsCard } from '@/components/profile/PersonalDetailsCard';
import { ToggleRow } from '@/components/profile/ToggleRow';

/** Server-derived profile seed (from the validated Supabase session + row). */
export interface InitialProfile {
  email: string;
  fullName: string;
  phone: string;
}

/** Split a full name into first / last for the details form. */
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}

export function ProfileApp({ initialProfile }: { initialProfile: InitialProfile }) {
  const router = useRouter();
  const { first: initialFirst, last: initialLast } = splitName(initialProfile.fullName);

  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [phone, setPhone] = useState(initialProfile.phone);

  // Preferences (local UI state — persistence lands in a later workstream)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const fullName = `${first} ${last}`.trim();
  const displayName = fullName || 'Your Profile';
  const initial = (fullName || initialProfile.email || 'U').charAt(0).toUpperCase();

  async function handleSave(next: { first: string; last: string; phone: string }) {
    const nextFull = `${next.first} ${next.last}`.trim();
    // Optimistic local state (instant UI); Nav updates itself via
    // onAuthStateChange once the metadata write below lands.
    setFirst(next.first);
    setLast(next.last);
    setPhone(next.phone);
    // Persist to Supabase so edits survive a reload.
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.updateUser({ data: { full_name: nextFull } });
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ phone: next.phone || null })
          .eq('id', data.user.id);
      }
    } catch {}
  }

  function handleLogout() {
    void signOutClient();
    router.push('/');
  }

  return (
    <div className="min-h-[calc(100dvh-68px)] bg-cream px-4 pt-28 pb-15 min-[641px]:px-5 min-[641px]:pt-28 min-[641px]:pb-20 min-[981px]:px-6 min-[981px]:pt-32 min-[981px]:pb-25">
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
          email={initialProfile.email}
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
