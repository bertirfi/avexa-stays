'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { Sentences } from '@/components/shared/Sentences';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { safeNext } from '@/lib/safeNext';

const perks = [
  'Earn AVEXA Coins on every stay',
  'Flexible cancellation — members only',
  'Spend coins on upsells and experiences',
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

type Mode = 'choose' | 'login' | 'signup' | 'forgot' | 'verify';

const inputClass =
  'w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark';
const darkBtn =
  'mt-0.5 w-full rounded-xl bg-ink px-[18px] py-[15px] text-[15px] font-bold text-white transition hover:bg-gold-dark disabled:opacity-60';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));

  const [mode, setMode] = useState<Mode>('choose');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'auth' ? 'Sign-in failed. Please try again.' : null,
  );
  const [info, setInfo] = useState<string | null>(null);

  const pwChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Upper & lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number', ok: /\d/.test(password) },
  ];
  const pwValid = pwChecks.every((c) => c.ok);

  function go(to: Mode) {
    setError(null);
    setInfo(null);
    setMode(to);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { data, error } = await getSupabaseBrowserClient().auth.signUp({
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
        // Email confirmation is ON → show the "check your email" screen.
        setMode('verify');
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
        },
      );
      if (error) {
        setError(error.message);
        return;
      }
      setInfo('If that email has an account, a password-reset link is on its way.');
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  const showBack = mode !== 'choose';

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0f0f0f] py-12">
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute -inset-[10%]" style={{ background: BG_1 }} />
        <div
          className="absolute -inset-[10%] [animation:drift_20s_ease-in-out_infinite_alternate]"
          style={{ background: BG_2, filter: 'blur(50px)' }}
        />
        <div className="absolute -inset-[10%]" style={{ background: BG_3 }} />
        <div className="absolute inset-0" style={{ background: BG_OVERLAY }} />
      </div>

      <Link
        href="/"
        className="absolute left-7 top-7 z-10 flex items-center gap-1.5 text-sm font-medium text-white/60 transition hover:text-gold"
      >
        <Icon name="chevLeft" size={16} />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[5] w-[min(420px,calc(100%-32px))] rounded-[24px] bg-gold-pale px-9 pb-9 pt-10 text-center"
      >
        {/* In-card back (between sub-steps) */}
        {showBack && (
          <button
            type="button"
            aria-label="Back"
            onClick={() => go(mode === 'signup' || mode === 'forgot' || mode === 'verify' ? 'login' : 'choose')}
            className="absolute left-5 top-5 grid size-8 place-items-center rounded-full text-ink transition hover:bg-ink/5"
          >
            <Icon name="chevLeft" size={18} />
          </button>
        )}

        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-ink">
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
              <line x1="3" y1="3" x2="17" y2="17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="17" y1="3" x2="3" y2="17" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-xl text-gold-dark">AVEXA</span>
        </div>

        <h1 className="font-display text-[26px] leading-[1.15] tracking-[-0.02em] text-ink">
          {mode === 'choose' && 'Your AVEXIAN journey starts here'}
          {mode === 'login' && 'Welcome back'}
          {mode === 'signup' && 'Join AVEXA'}
          {mode === 'forgot' && 'Reset your password'}
          {mode === 'verify' && 'Check your inbox'}
        </h1>

        {/* ── CHOOSE ── */}
        {mode === 'choose' && (
          <>
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
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={() => go('login')} className={darkBtn}>
                Continue with Email
              </button>
              <GoogleButton onClick={signInWithGoogle} />
            </div>
          </>
        )}

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-2.5">
            <input type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
            <PasswordInput value={password} onChange={setPassword} show={showPw} setShow={setShowPw}
              autoComplete="current-password" placeholder="Password" />
            <button type="button" onClick={() => go('forgot')}
              className="self-end text-[13px] font-semibold text-ink underline underline-offset-2">
              Forgot your password?
            </button>
            <Feedback error={error} info={info} />
            <button type="submit" disabled={pending} className={darkBtn}>
              {pending ? 'Please wait…' : 'Continue'}
            </button>
            <p className="mt-2 text-[13px] text-ink-60">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => go('signup')} className="font-bold text-ink underline underline-offset-2">
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* ── SIGNUP ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-2.5">
            <input type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
            <input type="text" required autoComplete="name" value={fullName}
              onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className={inputClass} />
            <PasswordInput value={password} onChange={setPassword} show={showPw} setShow={setShowPw}
              autoComplete="new-password" placeholder="Password" />
            <ul className="mb-1 mt-1 flex flex-col gap-1.5 text-left">
              {pwChecks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-[12.5px] text-ink-60">
                  <span className={`grid size-4 place-items-center rounded-full ${c.ok ? 'bg-gold-dark text-white' : 'bg-ink/10 text-ink-60'}`}>
                    <Icon name="check" size={9} strokeWidth={3} />
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>
            <Feedback error={error} info={info} />
            <button type="submit" disabled={pending || !pwValid} className={darkBtn}>
              {pending ? 'Please wait…' : 'Sign up'}
            </button>
            <p className="mt-2 text-[13px] text-ink-60">
              Already have an account?{' '}
              <button type="button" onClick={() => go('login')} className="font-bold text-ink underline underline-offset-2">
                Log in
              </button>
            </p>
          </form>
        )}

        {/* ── FORGOT ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="mt-6 flex flex-col gap-2.5">
            <p className="mb-1 text-[13.5px] text-ink-80">
              Enter your email and we&apos;ll send a link to reset your password.
            </p>
            <input type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
            <Feedback error={error} info={info} />
            <button type="submit" disabled={pending} className={darkBtn}>
              {pending ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => go('login')}
              className="mt-2 text-[13px] font-bold text-ink underline underline-offset-2">
              Back to log in
            </button>
          </form>
        )}

        {/* ── VERIFY ── */}
        {mode === 'verify' && (
          <div className="mt-5 flex flex-col gap-4 text-center">
            <p className="text-[14.5px] leading-[1.6] text-ink-80">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-ink">{email || 'your email'}</span>. Click it to
              activate your account, then log in.
            </p>
            <button type="button" onClick={() => go('login')} className={darkBtn}>
              Back to log in
            </button>
          </div>
        )}

        {/* Legal */}
        {(mode === 'choose' || mode === 'signup') && (
          <p className="mt-6 text-[11.5px] leading-[1.55] text-ink-60">
            By continuing, you agree to AVEXA&apos;s{' '}
            <Link href="/terms" className="text-ink-80 underline underline-offset-2">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-ink-80 underline underline-offset-2">Privacy Policy</Link>.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function Feedback({ error, info }: { error: string | null; info: string | null }) {
  if (!error && !info) return null;
  return error ? (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-left text-[13px] font-medium text-red-700">
      <Sentences text={error} />
    </p>
  ) : (
    <p className="rounded-lg bg-gold/15 px-3 py-2 text-left text-[13px] font-medium text-gold-dark">
      <Sentences text={info ?? ''} />
    </p>
  );
}

function PasswordInput({
  value, onChange, show, setShow, autoComplete, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (b: boolean) => void;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={6}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-60 transition hover:bg-ink/5"
      >
        <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  );
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] text-[15px] font-bold text-ink transition hover:border-ink hover:bg-cream"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.38z" />
        <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A11.5 11.5 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.6 14.7a6.9 6.9 0 0 1 0-4.4V7.32H1.76a11.5 11.5 0 0 0 0 10.36L5.6 14.7z" />
        <path fill="#EA4335" d="M12 4.77c1.68 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.2 15.1 0 12 0 7.4 0 3.4 2.64 1.76 6.5L5.6 9.48C6.5 6.77 9.02 4.77 12 4.77z" />
      </svg>
      Continue with Google
    </button>
  );
}
