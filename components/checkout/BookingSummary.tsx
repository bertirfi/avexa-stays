import Image from 'next/image';
import type { HydratedBooking } from '@/lib/booking';
import { shortDate } from '@/lib/booking';

interface BookingSummaryProps {
  hydrated: HydratedBooking;
}

export function BookingSummary({ hydrated }: BookingSummaryProps) {
  const { property, rate, raw, checkInDate, checkOutDate } = hydrated;
  const totalGuests = raw.guests.adults + raw.guests.children;

  return (
    <aside className="rounded-card border border-gray-line bg-white shadow-[var(--shadow-pill)]">
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-card">
        <Image
          src={property.cover}
          alt={property.name}
          fill
          sizes="(min-width: 1024px) 380px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-cream">
          <h4 className="font-display text-xl leading-tight">{property.name}</h4>
          <p className="text-xs text-cream/80">{property.address}</p>
        </div>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <Row label="Check-In / Out" value={`${shortDate(checkInDate)} – ${shortDate(checkOutDate)}`} />
        <Row label="Guests" value={`${totalGuests} guest${totalGuests === 1 ? '' : 's'}`} />

        <div className="border-t border-gray-line pt-3" />

        <Row label={`€ ${raw.pricePerNight} × ${raw.nights} night${raw.nights === 1 ? '' : 's'}`} value={`€ ${raw.subtotal}`} />
        <span className="inline-flex w-fit items-center rounded-full bg-gold-pale px-2.5 py-1 text-[11px] font-semibold text-gold-dark">
          Member rate applied
        </span>
        {raw.breakfastTotal > 0 && (
          <Row label="Breakfast" value={`€ ${raw.breakfastTotal}`} />
        )}

        <div className="border-t border-gray-line pt-3" />

        <Row label="City tax" value={`€ ${raw.cityTax}`} muted />
      </div>

      <div className="flex items-center justify-between border-t border-gray-line bg-cream px-5 py-4">
        <span className="text-xs text-ink-60">Taxes &amp; charges incl.</span>
        <span className="rounded-full bg-ink px-4 py-1.5 font-display text-cream">
          Total € {raw.total}
        </span>
      </div>

      {!rate.refundable && (
        <div className="border-t border-gray-line p-4 text-xs text-ink-60">
          <strong className="text-ink">*Non-refundable.</strong>{' '}
          This booking is non-refundable, even for a cancellation, and the travel dates cannot be modified.
        </div>
      )}

      <button
        type="button"
        className="block w-full border-t border-gray-line py-3 text-sm font-semibold text-ink-60 transition hover:text-gold-dark"
      >
        + Add Promo Code / Voucher
      </button>
    </aside>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? 'text-ink-60' : 'text-ink-80'}>{label}</span>
      <span className={muted ? 'text-ink-60' : 'font-semibold text-ink'}>{value}</span>
    </div>
  );
}
