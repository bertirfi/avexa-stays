'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { nameFromEmail, setHasTrips, writeUser } from '@/lib/booking';

const perks = [
  '15% off every booking, automatically',
  'Early check-in & late check-out',
  'Free cancellation until arrival day',
];

const BG_1 =
  'radial-gradient(ellipse 50% 60% at 25% 40%, rgba(221,185,122,.2), transparent 60%),' +
  'radial-gradient(ellipse 40% 50% at 75% 55%, rgba(176,136,64,.25), transparent 60%),' +
  'repeating-linear-gradient(130deg, rgba(255,255,255,.02) 0 2px, transparent 2px 24px),' +
  'linear-gradient(160deg,#1a1a1a 0%,#0f0f0f 100%)';
const BG_2 =
  'radial-gradient(ellipse 30% 40% at 20% 30%, rgba(255,220,160,.08), transparent 60%),' +
  'radial-gradient(ellipse 35% 30% at 70% 65%, rgba(255,180,120,.06), transparent 60%)';
const BG_3 =
  'repeating-linear-gradient(45deg, rgba(255,255,255,.012) 0 1px, transparent 1px 40px),' +
  'repeating-linear-gradient(-45deg, rgba(255,255,255,.008) 0 1px, transparent 1px 60px)';
const BG_OVERLAY =
  'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(15,15,15,.3), rgba(15,15,15,.7))';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/my-trips';

  const [email, setEmail] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  function doLogin(method: 'email' | 'google' | 'apple') {
    const finalEmail = email.trim() || 'guest@avexa.com';
    const firstName = nameFromEmail(finalEmail);
    writeUser({ loggedIn: true, email: finalEmail, firstName, name: firstName, method });
    setHasTrips(true);
    router.push(next);
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0f0f0f]">
      {/* Animated gradient background */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute -inset-[10%]" style={{ background: BG_1 }} />
        <div
          className="absolute -inset-[10%] [animation:drift_20s_ease-in-out_infinite_alternate]"
          style={{ background: BG_2, filter: 'blur(50px)' }}
        />
        <div className="absolute -inset-[10%]" style={{ background: BG_3 }} />
        <div className="absolute inset-0" style={{ background: BG_OVERLAY }} />
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="absolute left-7 top-7 z-10 flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-gold"
      >
        <Icon name="chevLeft" size={16} />
        Back
      </Link>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[5] w-[min(420px,calc(100%-32px))] rounded-[24px] bg-gold-pale px-10 pb-9 pt-11 text-center"
      >
        {/* Logo */}
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-ink">
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
              <line x1="3" y1="3" x2="17" y2="17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="17" y1="3" x2="3" y2="17" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-xl text-gold-dark">AVEXA</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-[28px] leading-[1.15] tracking-[-0.02em] text-ink">
          Your best rate
          <br />
          starts here
          <span
            aria-hidden
            className="ml-1.5 inline-block size-1.5 translate-y-px rounded-full bg-gold-dark pulse-dot align-middle"
          />
        </h1>

        {/* Perks */}
        <ul className="mx-auto mb-7 mt-5 flex max-w-[300px] flex-col gap-2 text-left">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-ink-80">
              <span className="grid size-5 flex-shrink-0 place-items-center rounded-full bg-ink text-gold">
                <Icon name="check" size={11} strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>

        {/* Email form (no label) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doLogin('email');
          }}
          className="flex flex-col gap-2.5"
        >
          <input
            ref={emailRef}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-[18px] py-[15px] text-[15px] font-bold text-white transition hover:bg-gold-dark"
          >
            Continue
          </button>
        </form>

        {/* Divider */}
        <div className="my-[18px] flex items-center gap-3.5">
          <span className="h-px flex-1 bg-ink/12" />
          <span className="font-mono-label text-ink-60">or</span>
          <span className="h-px flex-1 bg-ink/12" />
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => doLogin('google')}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-bold text-ink transition hover:border-ink hover:bg-cream"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => doLogin('apple')}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-bold text-ink transition hover:border-ink hover:bg-cream"
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        {/* Legal */}
        <p className="mt-6 text-[11.5px] leading-[1.55] text-ink-60">
          By continuing, you agree to AVEXA&apos;s{' '}
          <Link href="/terms" className="text-ink-80 underline underline-offset-2">Terms &amp; Conditions</Link>,{' '}
          <Link href="/privacy" className="text-ink-80 underline underline-offset-2">Privacy Policy</Link>, and{' '}
          <Link href="/membership" className="text-ink-80 underline underline-offset-2">Membership Terms</Link>.
        </p>

        {/* Switch */}
        <p className="mt-3.5 text-[13px] text-ink-60">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => emailRef.current?.focus()}
            className="font-bold text-ink underline underline-offset-2"
          >
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M21.35 11.1H12v3.84h5.36c-.23 1.5-1.66 4.4-5.36 4.4-3.23 0-5.86-2.66-5.86-5.95s2.63-5.95 5.86-5.95c1.84 0 3.07.78 3.78 1.45l2.58-2.49C16.6 4.66 14.5 3.7 12 3.7 6.96 3.7 2.9 7.8 2.9 12.9s4.06 9.2 9.1 9.2c5.26 0 8.74-3.69 8.74-8.88 0-.6-.06-1.05-.13-1.42z" fill="#4285F4" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M16.4 12.7c0-2.07 1.7-3.06 1.77-3.1-0.97-1.42-2.47-1.61-3-1.63-1.27-0.13-2.49 0.75-3.13 0.75-0.66 0-1.65-0.73-2.72-0.71-1.4 0.02-2.7 0.81-3.42 2.07-1.46 2.53-0.37 6.27 1.05 8.32 0.69 1.01 1.52 2.14 2.6 2.1 1.05-0.04 1.44-0.68 2.71-0.68 1.26 0 1.62 0.68 2.72 0.66 1.13-0.02 1.84-1.03 2.53-2.04 0.8-1.17 1.13-2.31 1.15-2.37-0.03-0.01-2.19-0.84-2.21-3.33zM14.36 6.5c0.58-0.7 0.97-1.67 0.86-2.64-0.83 0.03-1.84 0.55-2.44 1.25-0.54 0.62-1.01 1.61-0.88 2.56 0.93 0.07 1.88-0.47 2.46-1.17z" fill="currentColor" />
    </svg>
  );
}
