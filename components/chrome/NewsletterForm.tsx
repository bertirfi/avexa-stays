'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
    >
      {subscribed ? (
        <p className="font-mono-label flex-1 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-center text-gold sm:text-left">
          Subscribed ✓ See you in your inbox.
        </p>
      ) : (
        <>
          <input
            type="email"
            required
            placeholder="Your email"
            className="w-full rounded-full border border-cream/20 bg-transparent px-5 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none sm:flex-1"
          />
          <button
            type="submit"
            className="w-full shrink-0 whitespace-nowrap rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-pale sm:w-auto"
          >
            Sign me up
          </button>
        </>
      )}
    </form>
  );
}
