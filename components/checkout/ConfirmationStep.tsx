'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { generateConfirmationId, longDate, markHasTrips, type HydratedBooking } from '@/lib/booking';
import { useCurrency } from '@/components/currency/CurrencyProvider';

interface Props {
  hydrated: HydratedBooking;
}

export function ConfirmationStep({ hydrated }: Props) {
  const { property, rate, raw, checkInDate, checkOutDate } = hydrated;
  const [confId, setConfId] = useState<string | null>(null);
  const { format } = useCurrency();

  useEffect(() => {
    // Only generate the ID + flip the trips flag on the client
    setConfId(generateConfirmationId());
    markHasTrips();
  }, []);

  const guestsTotal = raw.guests.adults + raw.guests.children;

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-gold/20 text-gold-dark">
        <Icon name="check" size={36} strokeWidth={2.4} />
      </div>
      <h2 className="font-display text-3xl md:text-4xl">Booking confirmed!</h2>
      <p className="mt-3 text-ink-80">
        Your stay at {property.name} is all set. We&apos;ve sent the confirmation details to your email.
      </p>

      {confId && (
        <p className="font-mono-label mt-4 inline-block rounded-full bg-cream px-4 py-2 text-ink">
          {confId}
        </p>
      )}

      <dl className="mt-8 space-y-3 rounded-card border border-gray-line bg-white p-6 text-left">
        <Row label="Property" value={property.name} />
        <Row label="Check-in" value={`${longDate(checkInDate)}, 3:00 PM`} />
        <Row label="Check-out" value={`${longDate(checkOutDate)}, 11:00 AM`} />
        <Row label="Guests" value={`${guestsTotal} guest${guestsTotal === 1 ? '' : 's'}`} />
        <Row label="Rate" value={rate.name} />
        <Row label="Total paid" value={format(raw.total)} accent />
        <Row label="Door code" value="Sent 24h before" italic />
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/my-trips"
          className="rounded-full bg-ink px-6 py-3 text-center font-semibold text-cream transition hover:bg-gold hover:text-ink"
        >
          View My Trips
        </Link>
        <Link
          href="/locations"
          className="rounded-full border border-ink px-6 py-3 text-center font-semibold transition hover:bg-ink hover:text-cream"
        >
          Browse more stays
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  italic,
}: {
  label: string;
  value: string;
  accent?: boolean;
  italic?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-line/60 pb-2 last:border-0 last:pb-0 text-sm">
      <dt className="text-ink-60">{label}</dt>
      <dd
        className={
          accent
            ? 'font-display text-base text-gold-dark'
            : italic
              ? 'italic text-gold-dark'
              : 'font-medium text-ink'
        }
      >
        {value}
      </dd>
    </div>
  );
}
