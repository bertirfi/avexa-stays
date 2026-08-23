'use client';

import Image from 'next/image';
import type { HydratedBooking } from '@/lib/booking';
import { shortDate } from '@/lib/booking';
import type { QuoteState } from '@/components/checkout/CheckoutApp';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import { CANCELLATION_POLICY } from '@/lib/policies';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM-DD' → 'Aug 21' (no Date parsing — timezone-proof). */
function nightLabel(ymd: string): string {
  const [, m, d] = ymd.split('-').map(Number);
  return `${MONTHS_SHORT[(m ?? 1) - 1]} ${d}`;
}

interface BookingSummaryProps {
  hydrated: HydratedBooking;
  /** Authoritative server quote lifecycle — the ONLY money source shown here. */
  quoteState: QuoteState;
}

export function BookingSummary({ hydrated, quoteState }: BookingSummaryProps) {
  const { property, raw, checkInDate, checkOutDate } = hydrated;
  const totalGuests = raw.guests.adults + raw.guests.children;
  const { currency, format, approx } = useCurrency();

  const quote = quoteState.status === 'quoted' ? quoteState.quote : null;
  // Price drift: the localStorage draft was written off the 15-min cache; if the
  // authoritative quote disagrees, tell the guest the total below is the charge.
  const drifted = quote !== null && quote.totalRon !== raw.total;

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

      {drifted && (
        <div className="mx-5 mt-5 flex items-start gap-2.5 rounded-2xl border border-gold/40 bg-gold-pale/50 px-3.5 py-3 text-xs text-ink-80">
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-dark"
            aria-hidden
          />
          <span>
            Prices were refreshed — the total below is what you&apos;ll be charged.
          </span>
        </div>
      )}

      <div className="space-y-3 p-5 text-sm">
        <Row label="Check-In / Out" value={`${shortDate(checkInDate)} – ${shortDate(checkOutDate)}`} />
        <Row label="Guests" value={`${totalGuests} guest${totalGuests === 1 ? '' : 's'}`} />

        <div className="border-t border-gray-line pt-3" />

        {quote ? (
          <>
            {/* Accommodation — ONE total-price line (never a margin split),
                expandable into the real per-night prices (M1.1.6). */}
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="text-ink-80">
                  Accommodation · {quote.nights} night{quote.nights === 1 ? '' : 's'}
                  <span className="ml-1 text-xs text-ink-60 underline decoration-dotted group-open:hidden">
                    per night
                  </span>
                </span>
                <span className="font-semibold text-ink">{format(quote.accommodationRon)}</span>
              </summary>
              <ul className="mt-2 space-y-1 border-l border-gray-line pl-3 text-xs text-ink-60">
                {quote.nightly.map((n) => (
                  <li key={n.date} className="flex items-center justify-between gap-3">
                    <span>{nightLabel(n.date)}</span>
                    <span>
                      {n.ron.toLocaleString('en-US')} RON
                      {approx(n.ron) && <span className="ml-1">({approx(n.ron)})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
            {/* Factual label — every rate on the site is a member rate (login is
                mandatory); no discount delta exists in the breakdown to claim. */}
            <span className="inline-flex w-fit items-center rounded-full bg-gold-pale px-2.5 py-1 text-[11px] font-semibold text-gold-dark">
              Member rate
            </span>
            {quote.extrasRon > 0 && (
              <Row label="Extra services · Breakfast" value={format(quote.extrasRon)} />
            )}
            <Row label="Cleaning fee" value={format(quote.cleaningRon)} />

            <div className="border-t border-gray-line pt-3" />

            <Row
              label="City tax"
              value={format(quote.cityTaxRon)}
              approxValue={approx(quote.cityTaxRon)}
              muted
            />
          </>
        ) : (
          <MoneySkeleton />
        )}
      </div>

      <div className="border-t border-gray-line bg-cream px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-60">Taxes &amp; charges incl.</span>
          {quote ? (
            <span className="rounded-full bg-ink px-4 py-1.5 font-display text-cream">
              Total {format(quote.totalRon)}
            </span>
          ) : (
            <span className="h-8 w-24 animate-pulse rounded-full bg-gray-light" />
          )}
        </div>
        {quote && currency !== 'RON' && (
          <p className="mt-1.5 text-right text-[11px] text-ink-60">
            charged as {quote.totalRon.toLocaleString('en-US')} RON
          </p>
        )}
        <p className="mt-1 text-right text-[11px] text-ink-60">11% VAT included</p>
      </div>

      {/* Cancellation notice — single source of truth (lib/policies). */}
      <div className="border-t border-gray-line p-4 text-xs text-ink-60">
        <strong className="text-ink">Cancellation.</strong> {CANCELLATION_POLICY.summary}
      </div>

      <button
        type="button"
        className="block w-full border-t border-gray-line py-3 text-sm font-semibold text-ink-60 transition hover:text-gold-dark"
      >
        + Add Promo Code / Voucher
      </button>
    </aside>
  );
}

/** Placeholder rows while the authoritative quote is in flight. */
function MoneySkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="flex items-center justify-between">
        <span className="h-4 w-32 animate-pulse rounded-full bg-gray-light" />
        <span className="h-4 w-16 animate-pulse rounded-full bg-gray-light" />
      </div>
      <div className="border-t border-gray-line pt-3" />
      <div className="flex items-center justify-between">
        <span className="h-4 w-20 animate-pulse rounded-full bg-gray-light" />
        <span className="h-4 w-14 animate-pulse rounded-full bg-gray-light" />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  approxValue,
  muted,
}: {
  label: string;
  value: string;
  /** "≈ €11.43" equivalent shown muted/smaller next to a RON-real value (city tax). */
  approxValue?: string | null;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? 'text-ink-60' : 'text-ink-80'}>{label}</span>
      <span className={muted ? 'text-ink-60' : 'font-semibold text-ink'}>
        {value}
        {approxValue && <span className="ml-1 text-xs text-ink-60/80">({approxValue})</span>}
      </span>
    </div>
  );
}
