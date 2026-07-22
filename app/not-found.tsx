import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-ink px-6 text-center text-cream">
      <p className="font-mono-label text-gold">Error 404</p>
      <h1
        className="font-display mt-4"
        style={{ fontSize: 'clamp(32px, 6vw, 52px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
      >
        This page checked out.
      </h1>
      <p className="mt-4 max-w-md text-cream/60">
        The page you are looking for is not here. It may have moved, or it never
        existed. Let us get you back to a place worth staying.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gold px-6 py-3 font-semibold text-ink transition hover:bg-gold-dark"
        >
          Back to home
        </Link>
        <Link
          href="/locations"
          className="rounded-full border border-cream/25 px-6 py-3 font-semibold text-cream transition hover:border-gold hover:text-gold"
        >
          Browse stays
        </Link>
      </div>
    </main>
  );
}
