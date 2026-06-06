'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/chrome/Logo';
import { nameFromEmail, setHasTrips, writeUser } from '@/lib/booking';

const perks = [
  '15% off every booking, automatically',
  'Early check-in & late check-out',
  'Free cancellation until arrival day',
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/my-trips';

  const [email, setEmail] = useState('');

  function doLogin(method: 'email' | 'google' | 'apple') {
    const finalEmail = email.trim() || 'guest@avexa.com';
    const firstName = nameFromEmail(finalEmail);
    writeUser({
      loggedIn: true,
      email: finalEmail,
      firstName,
      name: firstName,
      method,
    });
    // Pre-populate trips so the demo feels real
    setHasTrips(true);
    router.push(next);
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-ink-60 transition hover:text-ink"
        >
          <Icon name="chevLeft" size={16} /> Back
        </Link>
        <Logo size={44} wordmarkSize={22} />
        <span className="w-12" />
      </header>

      <main className="mx-auto max-w-md px-6 pb-32 pt-12">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Your best rate starts here
          <span
            aria-hidden
            className="ml-1 inline-block size-[0.12em] -translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
          />
        </h1>

        <ul className="mt-8 space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-ink-80">
              <span className="mt-0.5 grid size-5 place-items-center rounded-full bg-gold-pale text-gold-dark">
                <Icon name="check" size={12} strokeWidth={2.5} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        {/* Email form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doLogin('email');
          }}
          className="mt-10 space-y-3"
        >
          <label className="block">
            <span className="font-mono-label mb-2 block text-ink-60">Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm focus:border-ink focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-ink py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink"
          >
            Continue
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-widest text-ink-60">
          <span className="h-px flex-1 bg-gray-line" />
          or
          <span className="h-px flex-1 bg-gray-line" />
        </div>

        {/* OAuth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => doLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-line bg-white py-3 font-semibold transition hover:border-ink"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => doLogin('apple')}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-line bg-white py-3 font-semibold transition hover:border-ink"
          >
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-ink-60">
          By continuing, you agree to AVEXA&apos;s{' '}
          <Link href="/terms" className="underline hover:text-gold-dark">Terms &amp; Conditions</Link>,{' '}
          <Link href="/privacy" className="underline hover:text-gold-dark">Privacy Policy</Link>, and{' '}
          <Link href="/membership" className="underline hover:text-gold-dark">Membership Terms</Link>.
        </p>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M21.35 11.1H12v3.84h5.36c-.23 1.5-1.66 4.4-5.36 4.4-3.23 0-5.86-2.66-5.86-5.95s2.63-5.95 5.86-5.95c1.84 0 3.07.78 3.78 1.45l2.58-2.49C16.6 4.66 14.5 3.7 12 3.7 6.96 3.7 2.9 7.8 2.9 12.9s4.06 9.2 9.1 9.2c5.26 0 8.74-3.69 8.74-8.88 0-.6-.06-1.05-.13-1.42z" fill="#4285F4"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M16.4 12.7c0-2.07 1.7-3.06 1.77-3.1-0.97-1.42-2.47-1.61-3-1.63-1.27-0.13-2.49 0.75-3.13 0.75-0.66 0-1.65-0.73-2.72-0.71-1.4 0.02-2.7 0.81-3.42 2.07-1.46 2.53-0.37 6.27 1.05 8.32 0.69 1.01 1.52 2.14 2.6 2.1 1.05-0.04 1.44-0.68 2.71-0.68 1.26 0 1.62 0.68 2.72 0.66 1.13-0.02 1.84-1.03 2.53-2.04 0.8-1.17 1.13-2.31 1.15-2.37-0.03-0.01-2.19-0.84-2.21-3.33zM14.36 6.5c0.58-0.7 0.97-1.67 0.86-2.64-0.83 0.03-1.84 0.55-2.44 1.25-0.54 0.62-1.01 1.61-0.88 2.56 0.93 0.07 1.88-0.47 2.46-1.17z" fill="currentColor"/>
    </svg>
  );
}
