'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { CalendarPopup } from '@/components/search/CalendarPopup';
import { GuestPopup } from '@/components/search/GuestPopup';
import { MobileBookingBar } from '@/components/stay/MobileBookingBar';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import type { Booking, GuestCounts, Property } from '@/types';
import type { AvailabilityMap } from '@/lib/data/availability';
import { ymd, parseYmd } from '@/lib/date';
import { CITY_TAX_RON_PER_PERSON_NIGHT } from '@/lib/currency';
import { readSearchPrefs, writeSearchPrefs } from '@/lib/searchPrefs';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/cn';

interface Props {
  property: Property;
  siblings?: Property[];
  /** Per-night prices + availability for the calendar (empty when offline). */
  availability?: AvailabilityMap;
}

// City tax: state tax, RON pass-through (no markup/fee) — see lib/currency.
const CITY_TAX_PER_PERSON = CITY_TAX_RON_PER_PERSON_NIGHT;

// v1: single-room — re-enable with the multi-room phase. Gates ONLY the
// "Add another room" UI rendering; the addedRoomIds state/logic stays wired
// so re-enabling later is a one-line flip.
const MULTI_ROOM_ENABLED = false;

// Launch: extra services (breakfast / late check-out / early check-in) are not
// sold yet — they return later via Stripe products or on-site upsells. Gates
// ONLY the upgrades UI; state/pricing plumbing stays wired for the flip back.
const UPGRADES_ENABLED = false;

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function nightsBetween(s: Date | null, e: Date | null) {
  if (!s || !e) return 0;
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86_400_000));
}

/** Saver (rates[0]) perNight for a sibling property. Returns null when rates are empty. */
function siblingPerNight(sib: Property): number | null {
  return sib.rates[0]?.perNight ?? null;
}

export function StayBookingSidebar({ property, siblings = [], availability }: Props) {
  const router = useRouter();
  const { currency, format, approx } = useCurrency();
  const [startDate, setStart] = useState<Date | null>(null);
  const [endDate, setEnd] = useState<Date | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 2, children: 0, infants: 0 });
  const [showGuests, setShowGuests] = useState(false);
  const [rateId, setRateId] = useState<'saver' | 'flex'>('saver');
  const [upgrades, setUpgrades] = useState<Record<string, boolean>>({
    breakfast: false,
    late_checkout: UPGRADES_ENABLED,
    early_checkin: UPGRADES_ENABLED,
  });
  const [priceOpen, setPriceOpen] = useState(false);

  // Multi-room state
  const [addedRoomIds, setAddedRoomIds] = useState<string[]>([]);

  const { user } = useAuth();
  const loggedIn = !!user;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Seed dates + guests: URL search params FIRST (deep links from the
    // /locations result cards), then localStorage prefs as before. Reading
    // window.location instead of useSearchParams keeps the sidebar in the
    // static (ISR) HTML — no Suspense/CSR bailout needed for a mount-only read.
    const q = new URLSearchParams(window.location.search);
    const urlIn = q.get('checkIn');
    const urlOut = q.get('checkOut');
    const urlAdults = q.get('adults');
    const urlGuests: GuestCounts | null =
      urlAdults !== null
        ? {
            adults: Math.min(10, Math.max(1, Number(urlAdults) || 1)),
            children: Math.min(10, Math.max(0, Number(q.get('children')) || 0)),
            infants: Math.min(10, Math.max(0, Number(q.get('infants')) || 0)),
          }
        : null;

    const hasAvailData = availability && Object.keys(availability).length > 0;
    const everyNightFree = (s: Date, e: Date) => {
      if (!hasAvailData) return true; // cache offline → can't validate, seed anyway
      const cur = new Date(s);
      while (cur < e) {
        // Missing row = NOT available (conservative, matches the results page).
        if (!availability?.[ymd(cur)]?.available) return false;
        cur.setDate(cur.getDate() + 1);
      }
      return true;
    };

    const p = readSearchPrefs();
    let seededFromUrl = false;
    if (urlIn || urlOut) {
      const s = parseYmd(urlIn);
      const e = parseYmd(urlOut);
      // Seed only a fully-free range — otherwise leave dates empty so the user
      // picks from the calendar (unavailable days are already disabled there).
      if (s && e && s < e && everyNightFree(s, e)) {
        setStart(s);
        setEnd(e);
        seededFromUrl = true;
      }
    } else if (p) {
      const s = parseYmd(p.checkIn);
      const e = parseYmd(p.checkOut);
      if (s) setStart(s);
      if (e) setEnd(e);
    }
    if (urlGuests) setGuests(urlGuests);
    else if (p?.guests) setGuests(p.guests);

    // Persist URL-seeded values so the header pill + /locations stay in sync
    // (this child effect runs before SearchProvider's localStorage hydration).
    if (seededFromUrl || urlGuests) {
      writeSearchPrefs({
        location: p?.location ?? '',
        checkIn: seededFromUrl ? urlIn : (p?.checkIn ?? null),
        checkOut: seededFromUrl ? urlOut : (p?.checkOut ?? null),
        guests: urlGuests ?? p?.guests ?? { adults: 2, children: 0, infants: 0 },
      });
    }
    // Mount-only seed — `availability` is a stable server prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Anchor the desktop calendar popup to the dates input via fixed positioning,
  // so the sidebar's `overflow-y-auto` cannot clip it.
  const datesBtnRef = useRef<HTMLButtonElement | null>(null);
  const [calPos, setCalPos] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!showCal) return;
    function place() {
      const el = datesBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCalPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [showCal]);

  const rate = property.rates.find((r) => r.id === rateId)!;
  const nights = nightsBetween(startDate, endDate);

  // Breakfast per-day-per-person price from the property's own upgrades catalog
  // (RON, money of record) — never hardcoded. Mirrors lib/booking/quote so the
  // sidebar estimate lines up with the authoritative checkout quote.
  const breakfastPrice = property.upgrades.find((u) => u.id === 'breakfast')?.price ?? 0;

  // Flex has no independent per-night calendar price — it inherits the catalog
  // flex/saver ratio on top of the live (saver-based) availability prices.
  // MUST mirror lib/booking/quote.ts so the displayed total equals the charge.
  const rateFactor = useMemo(() => {
    const saver = property.rates[0]?.perNight;
    const flex = property.rates[1]?.perNight;
    return rateId === 'flex' && saver && flex ? flex / saver : 1;
  }, [property.rates, rateId]);

  // Per-night member prices for the selected range: real prices from availability
  // where present, else the flat listing rate. Sum drives the total.
  const stayNightPrices = useMemo(() => {
    if (!startDate || nights === 0) return [] as number[];
    const out: number[] = [];
    const cur = new Date(startDate);
    for (let i = 0; i < nights; i += 1) {
      const baseNight =
        availability?.[ymd(cur)]?.ron ?? property.rates[0]?.perNight ?? rate.perNight;
      out.push(Math.round(baseNight * rateFactor));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [availability, startDate, nights, property.rates, rate.perNight, rateFactor]);

  const staySubtotal = stayNightPrices.reduce((a, b) => a + b, 0);
  const isVariablePricing = new Set(stayNightPrices).size > 1;

  // Siblings that have valid pricing (guard against missing rates[0])
  const validSiblings = useMemo(
    () => siblings.filter((s) => siblingPerNight(s) !== null),
    [siblings],
  );

  const addedRooms = useMemo(
    () => validSiblings.filter((s) => addedRoomIds.includes(s.id)),
    [validSiblings, addedRoomIds],
  );

  const availableToAdd = useMemo(
    () => validSiblings.filter((s) => !addedRoomIds.includes(s.id)),
    [validSiblings, addedRoomIds],
  );

  function addRoom(id: string) {
    if (validSiblings.some((s) => s.id === id)) {
      setAddedRoomIds((prev) => [...prev, id]);
    }
  }

  function removeRoom(id: string) {
    setAddedRoomIds((prev) => prev.filter((x) => x !== id));
  }

  const roomCount = 1 + addedRoomIds.length;

  const pricing = useMemo(() => {
    const occupants = guests.adults + guests.children;
    // Breakfast is priced in RON from the property's upgrades catalog (real
    // per-day-per-person price — no hardcoded figure).
    const breakfastTotal = upgrades.breakfast ? breakfastPrice * nights * occupants : 0;
    const mainCityTax = CITY_TAX_PER_PERSON * nights * occupants;
    // Member stay price = sum of per-night prices (variable from availability,
    // else flat rate.perNight × nights).
    const mainRoomTotal = staySubtotal + breakfastTotal + mainCityTax;

    // Added rooms keep the flat saver rate × nights + city tax (no per-room calendar).
    const addedRoomsTotal = addedRooms.reduce((sum, sib) => {
      const pn = siblingPerNight(sib)!;
      return sum + pn * nights + CITY_TAX_PER_PERSON * nights * occupants;
    }, 0);

    const combinedTotal = mainRoomTotal + addedRoomsTotal;

    return {
      staySubtotal,
      breakfastTotal,
      cityTax: mainCityTax,
      total: mainRoomTotal,
      combinedTotal,
      occupants,
    };
  }, [staySubtotal, nights, guests, upgrades, addedRooms, breakfastPrice]);

  // RON total actually charged — combinedTotal only applies once multi-room
  // re-enables (roomCount stays 1 in practice while MULTI_ROOM_ENABLED is false).
  const effectiveTotal = roomCount > 1 && MULTI_ROOM_ENABLED ? pricing.combinedTotal : pricing.total;

  function book() {
    if (!startDate || !endDate || nights === 0) {
      setShowCal(true);
      return;
    }
    const booking: Booking = {
      propertyId: property.id,
      checkIn: ymd(startDate),
      checkOut: ymd(endDate),
      nights,
      guests,
      rateId,
      upgrades,
      // Persist the MEMBER price (no rack / no struck framing) — matches the
      // sidebar and the no-struck-price decision; checkout shows this directly.
      pricePerNight: isVariablePricing ? Math.round(staySubtotal / nights) : rate.perNight,
      subtotal: staySubtotal,
      discount: 0,
      breakfastTotal: pricing.breakfastTotal,
      cityTax: pricing.cityTax,
      total: roomCount > 1 ? pricing.combinedTotal : pricing.total,
      addedRoomIds: addedRoomIds.length > 0 ? addedRoomIds : undefined,
    };
    try {
      window.localStorage.setItem('avexa_booking', JSON.stringify(booking));
    } catch {}
    router.push('/checkout');
  }

  const mobileBarPrice =
    nights === 0
      ? format(rate.perNight)
      : roomCount > 1 && MULTI_ROOM_ENABLED
        ? format(pricing.combinedTotal)
        : format(pricing.total);

  const ctaLabel =
    nights === 0
      ? 'Select dates'
      : !loggedIn
        ? 'Sign up & book →'
        : roomCount > 1 && MULTI_ROOM_ENABLED
          ? `Book ${roomCount} rooms →`
          : 'Book best rate →';

  const mobileBar = mounted
    ? createPortal(
        <MobileBookingBar
          priceLabel={nights === 0 ? 'From' : 'Total'}
          priceValue={mobileBarPrice}
          taxNote={nights === 0 ? '/night' : 'Taxes & charges incl.'}
          ctaLabel={ctaLabel}
          onBook={book}
        />,
        document.body,
      )
    : null;

  // Portal the DESKTOP calendar popup to body so the sidebar's overflow
  // doesn't clip it. Anchored via fixed positioning to the dates button.
  const desktopCalPortal =
    mounted && showCal && calPos
      ? createPortal(
          <div className="pointer-events-none fixed inset-0 z-[200] hidden lg:block">
            <div
              className="pointer-events-auto absolute inset-0"
              onClick={() => setShowCal(false)}
              aria-hidden
            />
            <div
              className="pointer-events-auto absolute"
              style={{ top: calPos.top, right: calPos.right }}
            >
              <CalendarPopup
                startDate={startDate}
                endDate={endDate}
                priceByDate={availability}
                onSelect={(s, e) => {
                  setStart(s);
                  setEnd(e);
                }}
                onClose={() => setShowCal(false)}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
    <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto rounded-card border border-gray-line bg-white p-6 shadow-[var(--shadow-pill)]">
      <div className="mb-4 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] text-gold-dark">{format(rate.perNight)}</span>
        <span className="text-sm text-ink-60">/night</span>
      </div>

      {/* Mobile: clean "Book your stay" rows */}
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

      {/* Dates (desktop input) — anchor for portaled popup */}
      <button
        ref={datesBtnRef}
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
      {/* Mobile: CalendarPopup self-portals a full-screen sheet (md:hidden inside) */}
      {showCal && (
        <div className="lg:hidden">
          <CalendarPopup
            startDate={startDate}
            endDate={endDate}
            priceByDate={availability}
            onSelect={(s, e) => {
              setStart(s);
              setEnd(e);
            }}
            onClose={() => setShowCal(false)}
            onBack={() => setShowCal(false)}
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
              <span className="font-display text-lg">{format(r.perNight)}<span className="text-xs text-ink-60">/night</span></span>
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

      {/* Upgrades (hidden at launch — UPGRADES_ENABLED) */}
      {UPGRADES_ENABLED && (
      <div className="mt-4 space-y-2">
        {property.upgrades.map((u) => (
          <label key={u.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-line p-3">
            <span className="text-sm">
              {u.name}
              {u.free && <span className="ml-2 rounded-full bg-gold-pale px-2 py-0.5 text-[10px] font-semibold text-gold-dark">FREE</span>}
            </span>
            <span className="flex items-center gap-3">
              {!u.free && (
                <span className="text-xs text-ink-60">+{format(u.price)}{u.unit}</span>
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
      )}

      {/* ── Add another room (v1: hidden — MULTI_ROOM_ENABLED) ── */}
      {MULTI_ROOM_ENABLED && validSiblings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-line p-4">
          <p className="font-mono-label mb-3 text-ink-60">Add another room</p>

          {/* Added rooms list */}
          {addedRooms.length > 0 && (
            <div className="mb-3 space-y-2">
              {/* Room 1 = current property (always first, no remove) */}
              <div className="flex items-center gap-3 rounded-xl bg-gold-pale px-3 py-2.5">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={property.cover}
                    alt={property.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{property.name}</p>
                  <p className="text-[10px] text-ink-60">Room 1 · this suite</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gold-dark">
                  {nights > 0 ? format(rate.perNight * nights) : `${format(rate.perNight)}/n`}
                </span>
              </div>

              {/* Added sibling rooms */}
              {addedRooms.map((sib, idx) => {
                const pn = siblingPerNight(sib)!;
                return (
                  <div key={sib.id} className="flex items-center gap-3 rounded-xl bg-gold-pale px-3 py-2.5">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={sib.cover}
                        alt={sib.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{sib.name}</p>
                      <span
                        className="inline-block size-1.5 rounded-full"
                        style={{ backgroundColor: sib.neighborhoodColor }}
                        aria-hidden
                      />
                      <span className="ml-1 text-[10px] text-ink-60">{sib.neighborhoodLabel}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gold-dark">
                      {nights > 0 ? format(pn * nights) : `${format(pn)}/n`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${sib.name}`}
                      onClick={() => removeRoom(sib.id)}
                      className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink/10 transition hover:bg-ink/20"
                    >
                      <Icon name="x" size={12} />
                    </button>
                    {/* Suppress unused idx variable */}
                    <span className="sr-only">Room {idx + 2}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Available to add */}
          {availableToAdd.length > 0 && (
            <div className="space-y-2">
              {availableToAdd.map((sib) => {
                const pn = siblingPerNight(sib)!;
                return (
                  <div key={sib.id} className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={sib.cover}
                        alt={sib.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{sib.name}</p>
                      <div className="flex items-center gap-1">
                        <span
                          className="inline-block size-1.5 rounded-full"
                          style={{ backgroundColor: sib.neighborhoodColor }}
                          aria-hidden
                        />
                        <span className="text-[10px] text-ink-60">{sib.neighborhoodLabel}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-gold-dark">
                      {nights > 0 ? format(pn * nights) : `from ${format(pn)}/n`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add ${sib.name}`}
                      onClick={() => addRoom(sib.id)}
                      className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition hover:bg-gold-dark"
                    >
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Hint when no dates selected */}
          {nights === 0 && (
            <p className="mt-3 text-[11px] text-ink-60">Select dates to see stay prices.</p>
          )}
        </div>
      )}
      {/* ── /Add another room ────────────────────────────────── */}

      {/* Price breakdown — single room */}
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
              {/* Accommodation — ONE total-price line, never the 18%/3% split */}
              <Row
                label={`Accommodation · ${nights} night${nights === 1 ? '' : 's'}`}
                value={format(pricing.staySubtotal)}
              />
              {MULTI_ROOM_ENABLED &&
                addedRooms.map((sib) => {
                  const pn = siblingPerNight(sib)!;
                  return (
                    <Row
                      key={sib.id}
                      label={`${sib.name} × ${nights}n`}
                      value={format(pn * nights)}
                    />
                  );
                })}
              {pricing.breakfastTotal > 0 && (
                <Row
                  label={`Extra services · Breakfast (${pricing.occupants}p × ${nights}n)`}
                  value={format(pricing.breakfastTotal)}
                />
              )}
              <Row
                label="City tax"
                value={format(pricing.cityTax * roomCount)}
                approxValue={approx(pricing.cityTax * roomCount)}
                muted
              />
            </ul>
          )}
          <div className="mt-3 border-t border-gray-line pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {roomCount > 1 && MULTI_ROOM_ENABLED ? `Order total (${roomCount} rooms)` : 'Total'}
              </span>
              <span className="font-display text-xl text-gold-dark">
                {format(effectiveTotal)}
              </span>
            </div>
            {currency !== 'RON' && (
              <p className="mt-0.5 text-right text-[11px] text-ink-60">
                charged as {effectiveTotal.toLocaleString('en-US')} RON
              </p>
            )}
            <p className="mt-1 text-right text-[11px] text-ink-60">VAT included</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={book}
        className="mt-5 w-full rounded-full bg-ink py-3 text-center font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        {ctaLabel}
      </button>

      <p className="mt-3 text-center text-[11px] text-ink-60">
        You won&apos;t be charged yet
      </p>
    </aside>
    {mobileBar}
    {desktopCalPortal}
    </>
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
    <li className={cn('flex items-center justify-between', muted && 'text-ink-60')}>
      <span>{label}</span>
      <span>
        {value}
        {approxValue && <span className="ml-1 text-xs text-ink-60/80">({approxValue})</span>}
      </span>
    </li>
  );
}
