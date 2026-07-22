import Link from 'next/link';
import Image from 'next/image';

/**
 * View model for a single trip card. Built server-side in
 * app/(member)/my-trips/page.tsx from a real `bookings` row joined with the
 * static property catalog — every label is pre-formatted so this component
 * stays purely presentational (and server-compatible: no hooks, no currency
 * context — the approx equivalent is baked in from the booking's stored rate).
 */
export interface Trip {
  id: string;
  orderId: string;
  propertyName: string;
  propertySubtitle: string;
  propertySlug: string;
  /** Property cover image path under /public, or null when the id is unknown. */
  cover: string | null;
  neighborhoodLabel: string;
  datesLabel: string;
  nightsLabel: string;
  guestsLabel: string;
  totalLabel: string;
  /** "≈ €420" from the booking's historical FX rate, or null when charged in RON. */
  approxLabel: string | null;
  /** Raw booking status: 'confirmed' | 'cancelled' | 'pending' | … */
  status: string;
}

export function TripsList({
  name,
  upcoming,
  past,
}: {
  name: string;
  upcoming: Trip[];
  past: Trip[];
}) {
  return (
    <section className="bg-cream pt-28 pb-20 md:pt-36">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05 }}
        >
          {name}&apos;s stays
        </h1>

        {/* Upcoming — rendered only when there are upcoming stays */}
        {upcoming.length > 0 && (
          <div className="mt-12">
            <h2 className="font-mono-label mb-4 text-gold-dark">— Upcoming</h2>
            <div className="grid gap-4">
              {upcoming.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          </div>
        )}

        {/* Past — rendered only when there are past stays */}
        {past.length > 0 && (
          <div className="mt-16">
            <h2 className="font-mono-label mb-4 text-ink-60">— Past stays</h2>
            <div className="grid gap-4">
              {past.map((t) => (
                <TripCard key={t.id} trip={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="overflow-hidden rounded-card border border-gray-line bg-white transition hover:shadow-[var(--shadow-card-hover)] sm:flex">
      {/* Cover */}
      {trip.cover && (
        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-56">
          <Image
            src={trip.cover}
            alt={trip.propertyName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 224px"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <NeighborhoodBadge label={trip.neighborhoodLabel} />
            <h3 className="font-display mt-2 text-2xl md:text-3xl">{trip.propertyName}</h3>
            <p className="mt-0.5 text-sm text-ink-60">{trip.propertySubtitle}</p>
          </div>
          <StatusBadge status={trip.status} />
        </div>

        <dl className="mt-5 grid gap-3 border-t border-gray-line pt-5 text-sm sm:grid-cols-2">
          <KV k="Dates" v={`${trip.datesLabel} · ${trip.nightsLabel}`} />
          <KV k="Guests" v={trip.guestsLabel} />
          <KV
            k="Total"
            v={trip.totalLabel}
            sub={trip.approxLabel ?? undefined}
            accent
          />
          {trip.orderId && (
            <div className="flex flex-col justify-center gap-1 border-b border-gray-line/60 pb-2 last:border-0 last:pb-0 sm:items-end">
              <span className="font-mono text-xs text-ink-60">Order {trip.orderId}</span>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href={`/locations/${trip.propertySlug}`}
            className="rounded-full border border-ink px-5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-cream"
          >
            View apartment
          </Link>
          <p className="text-sm text-ink-60">Need changes? Contact us below.</p>
        </div>
      </div>
    </article>
  );
}

function NeighborhoodBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink">
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  if (key === 'confirmed') {
    return <Badge className="bg-[#2E7D32]/12 text-[#2E7D32]">Confirmed</Badge>;
  }
  if (key === 'cancelled') {
    return <Badge className="bg-[#B23A3A]/10 text-[#B23A3A]">Cancelled</Badge>;
  }
  // pending / any other status — neutral, capitalized
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge className="bg-ink/5 text-ink-60">{label}</Badge>;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>
  );
}

function KV({
  k,
  v,
  sub,
  accent,
}: {
  k: string;
  v: string;
  /** Muted secondary line under the value — used for the "≈ €X" equivalent. */
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-line/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-ink-60">{k}</dt>
      <dd className={accent ? 'font-semibold text-ink' : 'text-ink'}>
        {v}
        {sub && <span className="ml-1.5 text-xs font-normal text-ink-60">{sub}</span>}
      </dd>
    </div>
  );
}
