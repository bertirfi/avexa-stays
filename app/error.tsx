'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Standard error-boundary logging; routes to real monitoring once analytics lands.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-ink px-6 text-center text-cream">
      <p className="font-mono-label text-gold">Something broke</p>
      <h1
        className="font-display mt-4"
        style={{ fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
      >
        A small hiccup on our side.
      </h1>
      <p className="mt-4 max-w-md text-cream/60">
        We hit an unexpected error. Try again — if it keeps happening, our team
        is already on it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-cream/25 px-6 py-3 font-semibold text-cream transition hover:border-gold hover:text-gold"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
