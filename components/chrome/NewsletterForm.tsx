'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
    >
      {subscribed ? (
        <p className="font-mono-label flex-1 rounded-full border border-gold/40 bg-gold/10 px-5 py-3 text-gold">
          Subscribed ✓ See you in your inbox.
        </p>
      ) : (
        <>
          <input
            type="email"
            required
            placeholder="you@somewhere.com"
            className="flex-1 rounded-full border border-cream/20 bg-transparent px-5 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-pale"
          >
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}
