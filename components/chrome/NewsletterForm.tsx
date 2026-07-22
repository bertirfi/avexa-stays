'use client';

import { useState } from 'react';

/** Form lifecycle — honest states, no fake success. */
type Status = 'idle' | 'submitting' | 'success' | 'error' | 'not-configured';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — stays empty for humans
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;

    // Client-side validity check before we bother the network.
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website }),
      });

      if (res.ok) {
        setStatus('success');
        return;
      }
      if (res.status === 503) {
        setStatus('not-configured');
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="font-mono-label flex-1 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-center text-gold sm:text-left">
        Subscribed — see you in the inbox.
      </p>
    );
  }

  if (status === 'not-configured') {
    return (
      <p className="font-mono-label flex-1 rounded-full border border-cream/20 bg-cream/5 px-5 py-3 text-center text-cream/70 sm:text-left">
        Subscriptions open soon.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit} noValidate>
      {/* Honeypot: hidden from humans (off-screen, tab-skipped, aria-hidden).
          Bots that fill every field trip it and get silently dropped. */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
      />
      <div className="flex flex-1 flex-col gap-1">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Your email"
          disabled={status === 'submitting'}
          aria-invalid={status === 'error'}
          className="w-full rounded-full border border-cream/20 bg-transparent px-5 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none disabled:opacity-60"
        />
        {status === 'error' && (
          <span className="px-5 text-[12px] text-gold/80">Something went wrong — try again.</span>
        )}
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-pale disabled:opacity-70 sm:w-auto"
      >
        {status === 'submitting' && (
          <span className="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
        )}
        {status === 'submitting' ? 'Signing up…' : 'Sign me up'}
      </button>
    </form>
  );
}
