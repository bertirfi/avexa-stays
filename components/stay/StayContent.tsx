import Link from 'next/link';
import { Icon } from '@/components/Icon';
import type { Property } from '@/types';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p, i) => (
        <p key={i} className="text-ink-80 leading-relaxed">
          {p}
        </p>
      ))}
    </>
  );
}

export function StayDescription({ property }: { property: Property }) {
  return (
    <section className="border-b border-gray-line py-10">
      <h2 className="font-display mb-6 text-2xl">About this space</h2>
      <div className="space-y-4">
        <Paragraphs text={property.description} />
      </div>

      {property.pitch && (
        <div className="mt-10 rounded-card bg-cream p-6">
          <h3 className="font-display mb-4 text-xl">The pitch</h3>
          <div className="space-y-4">
            <Paragraphs text={property.pitch} />
          </div>
        </div>
      )}
    </section>
  );
}

export function StayGoodToKnow({ property }: { property: Property }) {
  return (
    <section className="border-b border-gray-line py-10">
      {/* Desktop: always-visible heading + grid */}
      <div className="hidden md:block">
        <h2 className="font-display mb-6 text-2xl">Good to know</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card icon="key" title="Check-in" body={property.checkin} />
          <Card icon="clock" title="Check-out" body={property.checkout} />
          <Card icon="shield" title="House rules" body={`Up to ${property.maxGuests} guests. No pets. No parties.`} />
        </div>
        {property.goodToKnow && (
          <p className="mt-6 rounded-card bg-cream p-5 text-sm text-ink-80">{property.goodToKnow}</p>
        )}
      </div>

      {/* Mobile: collapsible accordion */}
      <details className="group md:hidden">
        <summary className="flex cursor-pointer items-center justify-between border-b border-gray-line pb-4">
          <h2 className="font-display text-xl font-bold">Good to know</h2>
          <Icon name="chevDown" size={20} className="shrink-0 transition group-open:rotate-180" />
        </summary>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Card icon="key" title="Check-in" body={property.checkin} />
          <Card icon="clock" title="Check-out" body={property.checkout} />
          <Card icon="shield" title="House rules" body={`Up to ${property.maxGuests} guests. No pets. No parties.`} />
        </div>
        {property.goodToKnow && (
          <p className="mt-6 rounded-card bg-cream p-5 text-sm text-ink-80">{property.goodToKnow}</p>
        )}
      </details>
    </section>
  );
}

function Card({ icon, title, body }: { icon: 'key' | 'clock' | 'shield'; title: string; body: string }) {
  return (
    <div className="rounded-card border border-gray-line p-5">
      <Icon name={icon} size={22} className="text-gold-dark" />
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm text-ink-60">{body}</p>
    </div>
  );
}

export function StayFAQ({ property }: { property: Property }) {
  if (property.faqs.length === 0) return null;
  return (
    <section className="border-b border-gray-line py-10">
      <h2 className="font-display mb-6 text-2xl">Frequently asked</h2>
      <div className="space-y-3">
        {property.faqs.map((faq, i) => (
          <details key={i} className="group rounded-card border border-gray-line p-5 open:bg-cream">
            <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-ink">
              {faq.q}
              <Icon name="chevDown" size={16} className="transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-ink-80">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function StayLocation({ property }: { property: Property }) {
  const mapsQuery = encodeURIComponent(`${property.address}`);
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Official Maps Embed API when the key is set; graceful fallback to the
  // keyless embed otherwise, so the map always renders.
  const mapSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${mapsQuery}&zoom=15`
    : `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  return (
    <section className="border-b border-gray-line py-10">
      <h2 className="font-display mb-6 text-2xl">Where you&apos;ll be</h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-ink-80">
          <Icon name="pin" size={18} className="text-gold-dark" />
          {property.address}
        </p>
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener"
          className="text-sm font-semibold underline-offset-4 hover:underline"
        >
          Open in Google Maps →
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-card border border-gray-line">
        <iframe
          title={`Map showing ${property.name}, ${property.address}`}
          src={mapSrc}
          width="100%"
          height="380"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block"
        />
      </div>

      {/* Nearby grouped */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {groupNearby(property.nearby).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="font-mono-label mb-3 text-ink-60">{cat}</h3>
            <ul className="space-y-2 text-sm">
              {items.map((n) => (
                <li key={n.name} className="flex justify-between gap-4 border-b border-dashed border-gray-line py-1.5">
                  <span className="text-ink-80">{n.name}</span>
                  <span className="text-ink-60">{n.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupNearby(items: Property['nearby']): Array<[string, Property['nearby']]> {
  const map = new Map<string, Property['nearby']>();
  for (const n of items) {
    const arr = map.get(n.category) ?? [];
    arr.push(n);
    map.set(n.category, arr);
  }
  return Array.from(map.entries());
}

export function StayTestimonials({ property }: { property: Property }) {
  if (property.reviews.length === 0) {
    return (
      <section className="border-b border-gray-line py-10">
        <h2 className="font-display mb-2 text-2xl">Guest reviews</h2>
        <p className="text-sm text-ink-60">No reviews yet. Be the first to stay.</p>
      </section>
    );
  }
  const avg = property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length;
  return (
    <section className="border-b border-gray-line py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl">Guest reviews</h2>
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="star" size={16} className="fill-gold text-gold" />
          {avg.toFixed(1)} · {property.reviews.length} reviews
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {property.reviews.slice(0, 4).map((r, i) => (
          <article key={i} className="rounded-card border border-gray-line p-5">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span className="font-semibold">{r.author}</span>
              {r.location && <span className="text-ink-60">· {r.location}</span>}
              <span className="ml-auto text-ink-60">{r.date}</span>
            </div>
            <p className="text-sm text-ink-80">{r.body}</p>
          </article>
        ))}
      </div>
      {property.reviews.length > 4 && (
        <details className="mt-4">
          <summary className="cursor-pointer rounded-full border border-ink px-5 py-2 text-sm font-semibold transition hover:bg-ink hover:text-cream">
            Show all {property.reviews.length} reviews
          </summary>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {property.reviews.slice(4).map((r, i) => (
              <article key={i} className="rounded-card border border-gray-line p-5">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold">{r.author}</span>
                  {r.location && <span className="text-ink-60">· {r.location}</span>}
                  <span className="ml-auto text-ink-60">{r.date}</span>
                </div>
                <p className="text-sm text-ink-80">{r.body}</p>
              </article>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
