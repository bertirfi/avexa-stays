'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { CalendarPopup } from '@/components/search/CalendarPopup';
import { GuestPopup } from '@/components/search/GuestPopup';
import { MobileBookingBar } from '@/components/stay/MobileBookingBar';
import type { Booking, GuestCounts, Property } from '@/types';
import { cn } from '@/lib/cn';

interface Props {
  property: Property;
}

const CITY_TAX_PER_PERSON = 3;

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function nightsBetween(s: Date | null, e: Date | null) {
  if (!s || !e) return 0;
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86_400_000));
}

export function StayBookingSidebar({ property }: Props) {
  const router = useRouter();
  const [startDate, setStart] = useState<Date | null>(null);
  const [endDate, setEnd] = useState<Date | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 2, children: 0, infants: 0 });
  const [showGuests, setShowGuests] = useState(false);
  const [rateId, setRateId] = useState<'saver' | 'flex'>('saver');
  const [upgrades, setUpgrades] = useState<Record<string, boolean>>({
    breakfast: false,
    late_checkout: true,
    early_checkin: true,
  });
  const [priceOpen, setPriceOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rate = property.rates.find((r) => r.id === rateId)!;
  const nights = nightsBetween(startDate, endDate);

  const pricing = useMemo(() => {
    // Anchor the breakdown to a rack ("regular") rate, matching the Claude Design
    // sidebar. The member rate IS that rack minus the rate's discount, so the
    // discount line is a real saving — not a second discount on top of the rate.
    const rackPerNight = Math.round(rate.perNight / (1 - rate.discount / 100));
    const subtotal = rackPerNight * nights; // at rack rate
    const afterDiscount = rate.perNight * nights; // member price
    const discount = subtotal - afterDiscount; // savings vs rack
    const occupants = guests.adults + guests.children;
    const breakfastTotal = upgrades.breakfast ? 20 * nights * occupants : 0;
    const cityTax = CITY_TAX_PER_PERSON * nights * occupants;
    const total = afterDiscount + breakfastTotal + cityTax;
    return { rackPerNight, subtotal, discount, afterDiscount, breakfastTotal, cityTax, total, occupants };
  }, [rate, nights, guests, upgrades]);

  function book() {
    if (!startDate || !endDate || nights === 0) {
      setShowCal(true);
      return;
    }
    const booking: Booking = {
      propertyId: property.id,
      checkIn: startDate.toISOString().slice(0, 10),
      checkOut: endDate.toISOString().slice(0, 10),
      nights,
      guests,
      rateId,
      upgrades,
      pricePerNight: pricing.rackPerNight,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      breakfastTotal: pricing.breakfastTotal,
      cityTax: pricing.cityTax,
      total: pricing.total,
    };
    try {
      window.localStorage.setItem('avexa_booking', JSON.stringify(booking));
    } catch {}
    router.push('/checkout');
  }

  const mobileBar = mounted
    ? createPortal(
        <MobileBookingBar
          priceLabel={nights === 0 ? 'From' : 'Total'}
          priceValue={nights === 0 ? `€${rate.perNight}` : `€${pricing.total}`}
          taxNote={nights === 0 ? '/night' : 'Taxes & charges incl.'}
          ctaLabel={nights === 0 ? 'Select dates' : 'Book best rate'}
          onBook={book}
        />,
        document.body,
      )
    : null;

  return (
    <>
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-card border border-gray-line bg-white p-6 shadow-[var(--shadow-pill)]">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="flex items-baseline gap-2">
          <span className="text-sm text-ink-60 line-through">€{pricing.rackPerNight}</span>
          <span className="font-display text-2xl">€{rate.perNight}</span>
        </span>
        <span className="text-sm text-ink-60">/ night</span>
      </div>

      {/* Mobile: clean "Book your stay" rows — tapping opens the full-screen
          calendar / guest bottom-sheet (same editors as desktop). */}
      <div className="mb-2 lg:hidden">
        <h3 className="font-display mb-1 text-lg">Book your stay</h3>
        <button
          type="button"
          onClick={() => setShowCal(true)}
          className="flex w-full items-center justify-between gap-3 border-b border-gray-line py-4 text-left"
        >
          <span className="text-sm text-ink-60">Arrival / departure</span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            {startDate && endDate
              ? `${formatDate(startDate)} – ${formatDate(endDate)}`
              : 'Add dates'}
            <Icon name="pencil" size={14} className="text-ink-60" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setShowGuests(true)}
          className="flex w-full items-center justify-between gap-3 py-4 text-left"
        >
          <span className="text-sm text-ink-60">Room 1</span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            {pricing.occupants} guest{pricing.occupants === 1 ? '' : 's'}
            {guests.infants > 0
              ? ` · ${guests.infants} infant${guests.infants === 1 ? '' : 's'}`
              : ''}
            <Icon name="pencil" size={14} className="text-ink-60" />
          </span>
        </button>
      </div>

      {/* Dates (desktop input) */}
      <button
        type="button"
        onClick={() => setShowCal((s) => !s)}
        className="hidden w-full grid-cols-2 rounded-2xl border border-gray-line text-left lg:grid"
      >
        <span className="border-r border-gray-line p-3">
          <span className="font-mono-label block text-ink-60">Check-in</span>
          <span className="text-sm font-semibold">{formatDate(startDate) ?? 'Add date'}</span>
        </span>
        <span className="p-3">
          <span className="font-mono-label block text-ink-60">Check-out</span>
          <span className="text-sm font-semibold">{formatDate(endDate) ?? 'Add date'}</span>
        </span>
      </button>
      {showCal && (
        <div className="mt-2">
          <CalendarPopup
            startDate={startDate}
            endDate={endDate}
            onSelect={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
            onClose={() => setShowCal(false)}
          />
        </div>
      )}

      {/* Guests (desktop input) */}
      <button
        type="button"
        onClick={() => setShowGuests((s) => !s)}
        className="mt-2 hidden w-full rounded-2xl border border-gray-line p-3 text-left lg:block"
      >
        <span className="font-mono-label block text-ink-60">Guests</span>
        <span className="text-sm font-semibold">
          {pricing.occupants} guest{pricing.occupants === 1 ? '' : 's'}
          {guests.infants > 0 ? ` · ${guests.infants} infant${guests.infants === 1 ? '' : 's'}` : ''}
        </span>
      </button>
      {showGuests && (
        <div className="mt-2">
          <GuestPopup
            guests={guests}
            onChange={setGuests}
            onClose={() => setShowGuests(false)}
          />
        </div>
      )}

      {/* Rate selector */}
      <div className="mt-4 space-y-2">
        {property.rates.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRateId(r.id)}
            className={cn(
              'w-full rounded-2xl border p-4 text-left transition',
              rateId === r.id
                ? 'border-gold bg-gold-pale'
                : 'border-gray-line hover:border-ink',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{r.name}</span>
              <span className="font-display text-lg">€{r.perNight}<span className="text-xs text-ink-60">/night</span></span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-ink-80">
              {r.perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Icon name="check" size={12} className="mt-0.5 text-gold-dark" />
                  {p}
                </li>
              ))}
            </ul>
            {r.warn && <p className="mt-2 text-xs italic text-ink-60">{r.warn}</p>}
            {r.highlight && <p className="mt-2 text-xs font-semibold text-gold-dark">{r.highlight}</p>}
          </button>
        ))}
      </div>

      {/* Upgrades */}
      <div className="mt-4 space-y-2">
        {property.upgrades.map((u) => (
          <label key={u.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-line p-3">
            <span className="text-sm">
              {u.name}
              {u.free && <span className="ml-2 rounded-full bg-gold-pale px-2 py-0.5 text-[10px] font-semibold text-gold-dark">FREE</span>}
            </span>
            <span className="flex items-center gap-3">
              {!u.free && (
                <span className="text-xs text-ink-60">+€{u.price}{u.unit}</span>
              )}
              <input
                type="checkbox"
                checked={upgrades[u.id] ?? false}
                onChange={(e) => setUpgrades((s) => ({ ...s, [u.id]: e.target.checked }))}
                className="size-4 accent-gold-dark"
              />
            </span>
          </label>
        ))}
      </div>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-line p-4">
          <button
            type="button"
            onClick={() => setPriceOpen((s) => !s)}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            Price details
            <Icon name="chevDown" size={14} className={cn('transition', priceOpen && 'rotate-180')} />
          </button>
          {priceOpen && (
            <ul className="mt-3 space-y-1.5 text-sm">
              <Row label={`€${pricing.rackPerNight} × ${nights} night${nights === 1 ? '' : 's'}`} value={`€${pricing.subtotal}`} />
              <Row label={`Member discount (${rate.discount}%)`} value={`-€${pricing.discount}`} muted />
              {pricing.breakfastTotal > 0 && (
                <Row label={`Breakfast (${pricing.occupants}p × ${nights}n)`} value={`€${pricing.breakfastTotal}`} />
              )}
              <Row label={`City tax (€${CITY_TAX_PER_PERSON}/p/night)`} value={`€${pricing.cityTax}`} muted />
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-gray-line pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl">€{pricing.total}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={book}
        className="mt-5 w-full rounded-full bg-ink py-3 text-center font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        {nights === 0 ? 'Select dates' : 'Book best rate →'}
      </button>

      <p className="mt-3 text-center text-[11px] text-ink-60">
        You won&apos;t be charged yet
      </p>
    </aside>
    {mobileBar}
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <li className={cn('flex items-center justify-between', muted && 'text-ink-60')}>
      <span>{label}</span>
      <span>{value}</span>
    </li>
  );
}
