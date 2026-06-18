import Link from 'next/link';
import type { MockTrip } from '@/lib/trips';
import { upcomingTrips, pastTrips } from '@/lib/trips';

export function TripsList({ name }: { name: string }) {
  const upcoming = upcomingTrips();
  const past = pastTrips();
  return (
    <section className="bg-cream pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05 }}
        >
          {name}&apos;s stays
        </h1>

        {/* Upcoming */}
        <div className="mt-12">
          <h2 className="font-mono-label mb-4 text-gold-dark">— Upcoming</h2>
          <div className="grid gap-4">
            {upcoming.map((t) => (
              <UpcomingCard key={t.id} trip={t} />
            ))}
            {upcoming.length === 0 && (
              <EmptyGroup label="No upcoming stays yet." />
            )}
          </div>
        </div>

        {/* Past */}
        <div className="mt-16">
          <h2 className="font-mono-label mb-4 text-ink-60">— Past stays</h2>
          <div className="grid gap-4">
            {past.map((t) => (
              <PastCard key={t.id} trip={t} />
            ))}
            {past.length === 0 && (
              <EmptyGroup label="No past stays yet." />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function UpcomingCard({ trip }: { trip: MockTrip }) {
  return (
    <article className="rounded-card border border-gray-line bg-white p-6 transition hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <NeighborhoodBadge name={trip.neighborhood} color={trip.neighborhoodColor} />
          <h3 className="font-display mt-2 text-2xl md:text-3xl">{trip.propertyName}</h3>
          <p className="mt-1 text-sm text-ink-60">{trip.dateRange}</p>
          <p className="mt-1 text-sm text-ink-80">{trip.details}</p>
        </div>
        <StatusPill label={trip.status} tone="green" />
      </div>

      <dl className="mt-6 grid gap-3 border-t border-gray-line pt-5 text-sm md:grid-cols-2">
        {trip.checkInTime && <KV k="Check-in" v={trip.checkInTime} />}
        {trip.checkOutTime && <KV k="Check-out" v={trip.checkOutTime} />}
        {trip.doorCodeStatus && <KV k="Door code" v={trip.doorCodeStatus} italic />}
        <KV k="Total" v={`${trip.totalPrice} · ${trip.perNightRate}`} accent />
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/locations/101"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-gold hover:text-ink"
        >
          View details
        </Link>
        <button
          type="button"
          className="rounded-full border border-ink px-5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-cream"
        >
          Modify booking
        </button>
        <button
          type="button"
          className="text-sm font-semibold text-ink-60 transition hover:text-ink"
        >
          Cancel booking
        </button>
      </div>
    </article>
  );
}

function PastCard({ trip }: { trip: MockTrip }) {
  return (
    <article className="rounded-card border border-gray-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <NeighborhoodBadge name={trip.neighborhood} color={trip.neighborhoodColor} />
          <h3 className="font-display mt-2 text-2xl">{trip.propertyName}</h3>
          <p className="mt-1 text-sm text-ink-60">{trip.dateRange}</p>
          <p className="mt-1 text-sm text-ink-80">{trip.details}</p>
        </div>
        <StatusPill label={trip.status} tone="gray" />
      </div>
      <p className="mt-4 text-sm text-ink-60">
        {trip.totalPrice} · {trip.perNightRate}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/locations"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-gold hover:text-ink"
        >
          Book again
        </Link>
        <button
          type="button"
          className="rounded-full border border-ink px-5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-cream"
        >
          View receipt
        </button>
      </div>
    </article>
  );
}

function NeighborhoodBadge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
      <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
      {name}
    </span>
  );
}

function StatusPill({ label, tone }: { label: string; tone: 'green' | 'gray' }) {
  const cls =
    tone === 'green'
      ? 'bg-[#2E7D32]/12 text-[#2E7D32]'
      : 'bg-ink/5 text-ink-60';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

function KV({
  k,
  v,
  italic,
  accent,
}: {
  k: string;
  v: string;
  italic?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-line/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-ink-60">{k}</dt>
      <dd
        className={
          accent
            ? 'font-semibold text-ink'
            : italic
              ? 'italic text-gold-dark'
              : 'text-ink'
        }
      >
        {v}
      </dd>
    </div>
  );
}

function EmptyGroup({ label }: { label: string }) {
  return (
    <p className="rounded-card border border-dashed border-gray-line p-6 text-center text-sm text-ink-60">
      {label}
    </p>
  );
}
