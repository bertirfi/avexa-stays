import Link from 'next/link';

export function EmptyTripsState({ name }: { name: string }) {
  return (
    <section className="bg-cream pt-32 md:pt-40">
      <div className="mx-auto grid max-w-3xl gap-12 px-6 text-center md:px-10">
        {/* Stylized cityscape — pure CSS, no asset needed */}
        <div className="relative mx-auto h-40 w-full max-w-md overflow-hidden rounded-card bg-ink">
          <div className="absolute inset-x-4 bottom-0 flex items-end gap-1.5">
            {[28, 56, 36, 80, 44, 60, 32, 72, 40, 52, 30].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-md"
                style={{
                  height: h,
                  background: i % 3 === 0 ? '#DDB97A' : 'rgba(247, 237, 219, 0.18)',
                }}
              />
            ))}
          </div>
          <span
            aria-hidden
            className="absolute right-8 top-8 size-3 rounded-full bg-gold pulse-dot"
          />
        </div>

        <div>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', lineHeight: 1.05 }}
          >
            Hi {name}, no trips yet — let&apos;s fix that.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-ink-80">
            Browse our Bucharest apartments and book your first stay. Your booking details, check-in codes, and trip history will all appear here.
          </p>
          <Link
            href="/locations"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink"
          >
            Start exploring →
          </Link>
        </div>
      </div>
    </section>
  );
}
