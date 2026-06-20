'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { safeNext } from '@/lib/safeNext';

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

type Mode = 'login' | 'signup';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));

  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'auth' ? 'Sign-in failed. Please try again.' : null,
  );
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (!data.session) {
          // Email confirmation is ON in the Supabase project.
          setInfo('Check your email to confirm your account, then log in.');
          setMode('login');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
          return;
        }
      }
      // Session is set → AuthProvider mirrors it; refresh server components.
      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  const isSignup = mode === 'signup';

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0f0f0f] py-12">
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
          {isSignup ? 'Join AVEXA' : 'Welcome back'}
          <span
            aria-hidden
            className="ml-1.5 inline-block size-1.5 translate-y-px rounded-full bg-gold-dark pulse-dot align-middle"
          />
        </h1>

        {/* Perks (signup only) */}
        {isSignup && (
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
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className={`flex flex-col gap-2.5 ${isSignup ? '' : 'mt-6'}`}>
          {isSignup && (
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark"
            />
          )}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? 'Password (min 6 characters)' : 'Password'}
            className="w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark"
          />

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-left text-[13px] font-medium text-red-700">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-gold/15 px-3 py-2 text-left text-[13px] font-medium text-gold-dark">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-0.5 w-full rounded-xl bg-ink px-[18px] py-[15px] text-[15px] font-bold text-white transition hover:bg-gold-dark disabled:opacity-60"
          >
            {pending ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-[18px] flex items-center gap-3.5">
          <span className="h-px flex-1 bg-ink/12" />
          <span className="font-mono-label text-ink-60">or</span>
          <span className="h-px flex-1 bg-ink/12" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-bold text-ink transition hover:border-ink hover:bg-cream"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Legal */}
        <p className="mt-6 text-[11.5px] leading-[1.55] text-ink-60">
          By continuing, you agree to AVEXA&apos;s{' '}
          <Link href="/terms" className="text-ink-80 underline underline-offset-2">Terms &amp; Conditions</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-ink-80 underline underline-offset-2">Privacy Policy</Link>.
        </p>

        {/* Switch mode */}
        <p className="mt-3.5 text-[13px] text-ink-60">
          {isSignup ? 'Already have an account?' : 'New to AVEXA?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'login' : 'signup');
              setError(null);
              setInfo(null);
            }}
            className="font-bold text-ink underline underline-offset-2"
          >
            {isSignup ? 'Log in' : 'Sign up'}
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
