import Link from 'next/link';

export function LoggedOutHero() {
  return (
    <section className="bg-cream pt-32 md:pt-40">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(48px, 7.5vw, 92px)' }}
        >
          Your next stay
          <span
            aria-hidden
            className="ml-1 inline-block size-[0.14em] -translate-y-[0.04em] rounded-full bg-gold align-baseline pulse-dot"
          />
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-ink-80">
          Your upcoming check-ins, past adventures, booking details and member perks — everything lives here. Sign in and pick up right where you left off.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?next=/my-trips"
            className="rounded-full bg-ink px-8 py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/login?next=/my-trips"
            className="rounded-full border border-ink px-8 py-3 font-semibold transition hover:bg-ink hover:text-cream"
          >
            Create an account
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink-60">
          Free to join · No credit card required
        </p>
      </div>
    </section>
  );
}
