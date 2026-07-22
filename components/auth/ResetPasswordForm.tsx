'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Icon } from '@/components/Icon';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Gate state: are we allowed to render the password form? */
type Gate = 'checking' | 'ready' | 'expired';

export function ResetPasswordForm() {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>('checking');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A password-reset link only works while a recovery/authenticated session is
  // live. Check the session on mount, and also listen for PASSWORD_RECOVERY —
  // recovery links land via the auth callback and may hydrate the session a
  // beat after this component mounts.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setGate(data.user ? 'ready' : 'expired');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setGate('ready');
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Upper & lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number', ok: /\d/.test(password) },
  ];
  const valid = checks.every((c) => c.ok);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      router.push('/my-trips');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0f0f0f] py-12">
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 25% 40%, rgba(221,185,122,.2), transparent 60%),' +
            'radial-gradient(ellipse 40% 50% at 75% 55%, rgba(176,136,64,.25), transparent 60%),' +
            'linear-gradient(160deg,#1a1a1a 0%,#0f0f0f 100%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[5] w-[min(420px,calc(100%-32px))] rounded-[24px] bg-gold-pale px-9 pb-9 pt-10 text-center"
      >
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-ink">
            <Icon name="key" size={18} className="text-gold" />
          </span>
          <span className="font-display text-xl text-gold-dark">AVEXA</span>
        </div>

        {gate === 'checking' ? (
          <div className="flex flex-col items-center gap-3 py-6" role="status" aria-live="polite">
            <span className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-gold-dark" />
            <span className="text-[13px] text-ink-60">Verifying your reset link…</span>
          </div>
        ) : gate === 'expired' ? (
          <>
            <h1 className="font-display text-[26px] leading-[1.15] tracking-[-0.02em] text-ink">
              Link expired or invalid
            </h1>
            <p className="mt-4 text-[14px] leading-[1.6] text-ink-80">
              Password reset links are single-use and expire quickly. Request a new one from the
              sign-in page.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-xl bg-ink px-[18px] py-[15px] text-[15px] font-bold text-white transition hover:bg-gold-dark"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-[26px] leading-[1.15] tracking-[-0.02em] text-ink">
              Set a new password
            </h1>

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2.5">
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-xl border-[1.5px] border-gray-line bg-white px-[18px] py-[15px] pr-12 text-[15px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark"
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

              <ul className="mb-1 mt-1 flex flex-col gap-1.5 text-left">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-[12.5px] text-ink-60">
                    <span className={`grid size-4 place-items-center rounded-full ${c.ok ? 'bg-gold-dark text-white' : 'bg-ink/10 text-ink-60'}`}>
                      <Icon name="check" size={9} strokeWidth={3} />
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-left text-[13px] font-medium text-red-700">{error}</p>
              )}

              {done && !error && (
                <p className="rounded-lg bg-gold/15 px-3 py-2 text-left text-[13px] font-medium text-gold-dark">
                  Password updated — taking you to your trips…
                </p>
              )}

              <button
                type="submit"
                disabled={pending || !valid}
                className="mt-0.5 w-full rounded-xl bg-ink px-[18px] py-[15px] text-[15px] font-bold text-white transition hover:bg-gold-dark disabled:opacity-60"
              >
                {pending ? 'Updating…' : 'Update password'}
              </button>
              <Link href="/login" className="mt-2 text-[13px] font-bold text-ink underline underline-offset-2">
                Back to log in
              </Link>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
