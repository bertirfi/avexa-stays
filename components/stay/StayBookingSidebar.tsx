'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/Icon';
import { CalendarPopup } from '@/components/search/CalendarPopup';
import { GuestPopup } from '@/components/search/GuestPopup';
import { MobileBookingBar } from '@/components/stay/MobileBookingBar';
import { StickyBookingBar } from '@/components/stay/StickyBookingBar';
import { useCurrency } from '@/components/currency/CurrencyProvider';
import type { Booking, GuestCounts, Property } from '@/types';
import type { AvailabilityMap } from '@/lib/data/availability';
import { ymd, parseYmd } from '@/lib/date';
import { CITY_TAX_RON_PER_PERSON_NIGHT } from '@/lib/currency';
import { CANCELLATION_POLICY } from '@/lib/policies';
import { readSearchPrefs, writeSearchPrefs } from '@/lib/searchPrefs';
import { buildSearchQuery, readGuestParams, readRangeParams } from '@/lib/searchParams';
import { useAuth } from '@/components/auth/AuthProvider';
import { CONTACT_EMAIL } from '@/lib/contact';
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

// Mirrors lib/booking/quote.ts MAX_NIGHTS — duplicated here (not imported)
// because that module pulls in the server-only Hostaway client.
const MAX_NIGHTS = 30;

/** Clamp URL/localStorage-seeded guests to this property's capacity: drop
 * children first, then adults down to a floor of 1. Infants are untouched. */
function clampGuestsToMax(g: GuestCounts, maxGuests: number): GuestCounts {
  let { adults, children } = g;
  while (adults + children > maxGuests && children > 0) children -= 1;
  while (adults + children > maxGuests && adults > 1) adults -= 1;
  return { adults, children, infants: g.infants };
}

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

/** Today in Europe/Bucharest — the guest may sit in any timezone, the calendar
 *  is the property's. en-CA formats as YYYY-MM-DD. */
function todayInBucharest(): Date {
  const s = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
  return parseYmd(s) ?? new Date();
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Default range so the total is on screen the moment the page loads (Numa
 * parity) instead of an empty "Add dates" box:
 *   1. first free day of NEXT calendar month, min_stay honoured;
 *   2. else the first free day from today+7 onwards;
 *   3. else — availability cache offline — the 15th of next month, 1 night.
 * Returns null when the cache IS loaded but holds no bookable window at all,
 * in which case the box keeps its "Add dates" empty state.
 */
function pickDefaultRange(availability: AvailabilityMap | undefined): [Date, Date] | null {
  const today = todayInBucharest();

  if (!availability || Object.keys(availability).length === 0) {
    const start = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    return [start, addDays(start, 1)];
  }

  /** Nights to book starting on `d` (= its min_stay), or null when not bookable. */
  const nightsFrom = (d: Date): number | null => {
    const day = availability[ymd(d)];
    if (!day?.available) return null;
    const n = Math.max(1, day.minStay);
    // Seeding a range the server would reject dead-ends the guest at checkout.
    if (n > MAX_NIGHTS) return null;
    for (let i = 1; i < n; i += 1) {
      if (!availability[ymd(addDays(d, i))]?.available) return null;
    }
    return n;
  };

  const scan = (from: Date, until: Date): [Date, Date] | null => {
    for (let d = from; d <= until; d = addDays(d, 1)) {
      const n = nightsFrom(d);
      if (n !== null) return [d, addDays(d, n)];
    }
    return null;
  };

  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  // Day 0 of month+2 = last day of month+1.
  const lastOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  // The cache covers ~180 days; scanning a year just runs off its end harmlessly.
  return scan(firstOfNextMonth, lastOfNextMonth) ?? scan(addDays(today, 7), addDays(today, 365));
}

export function StayBookingSidebar({ property, siblings = [], availability }: Props) {
  const router = useRouter();
  const { currency, format, approx } = useCurrency();
  const [startDate, setStart] = useState<Date | null>(null);
  const [endDate, setEnd] = useState<Date | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 2, children: 0, infants: 0 });
  const [showGuests, setShowGuests] = useState(false);
  const [upgrades, setUpgrades] = useState<Record<string, boolean>>({
    breakfast: false,
    late_checkout: UPGRADES_ENABLED,
    early_checkin: UPGRADES_ENABLED,
  });
  const [priceOpen, setPriceOpen] = useState(false);
  /** True while the range on screen came from pickDefaultRange, not the guest. */
  const [autoPicked, setAutoPicked] = useState(false);

  /** Every calendar edit goes through here so an auto-seeded range stops being
   *  "auto" the moment the guest touches it (and starts mirroring to the URL). */
  function selectRange(s: Date | null, e: Date | null) {
    setAutoPicked(false);
    setStart(s);
    setEnd(e);
  }

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
    const { arrival: urlIn, departure: urlOut } = readRangeParams(q);
    const urlGuests: GuestCounts | null = readGuestParams(q);

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
    if (urlGuests) setGuests(clampGuestsToMax(urlGuests, property.maxGuests));
    else if (p?.guests) setGuests(clampGuestsToMax(p.guests, property.maxGuests));

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

  // Numa parity: with no URL params and no saved prefs the box would open on
  // "Add dates" with no total. Fill the VOID ONLY — this runs after the seed
  // above has committed, so a URL/prefs range is already in state and wins.
  useEffect(() => {
    if (!mounted || startDate || endDate) return;
    const range = pickDefaultRange(availability);
    if (!range) return;
    setStart(range[0]);
    setEnd(range[1]);
    setAutoPicked(true);
    // Runs once, right after the mount seed — re-running on date changes would
    // re-seed the moment the guest clears the calendar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Mirror the picked dates into the URL so the stay page is shareable and the
  // header pill / back-nav to /locations keep the same range. replace +
  // scroll:false = no history spam, no jump, and the page stays static (the
  // seed above reads window.location, never useSearchParams).
  useEffect(() => {
    if (!mounted) return; // don't clobber the URL before the seed has run
    // An auto-seeded range is a convenience, not a guest choice — never put it
    // in the URL (nor in searchPrefs), or it would leak into shared links, the
    // header pill and /locations as if the guest had searched for it.
    if (autoPicked) return;
    // No dates → keep the bare canonical URL, no guest-count noise.
    const query =
      startDate && endDate
        ? buildSearchQuery({ start: startDate, end: endDate, guests })
        : '';
    const next = query ? `?${query}` : '';
    if (window.location.search === next) return;
    router.replace(`${window.location.pathname}${next}`, { scroll: false });
  }, [mounted, autoPicked, startDate, endDate, guests, router]);

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

  // Single flat rate since M1.1 — rates[0] is the one direct rate.
  const rate = property.rates[0];
  const nights = nightsBetween(startDate, endDate);
  // Server (lib/booking/quote.ts) rejects stays over MAX_NIGHTS — surface the
  // limit here so the calendar doesn't dead-end the guest at checkout.
  const exceedsMaxNights = nights > MAX_NIGHTS;

  // Breakfast per-day-per-person price from the property's own upgrades catalog
  // (RON, money of record) — never hardcoded. Mirrors lib/booking/quote so the
  // sidebar estimate lines up with the authoritative checkout quote.
  const breakfastPrice = property.upgrades.find((u) => u.id === 'breakfast')?.price ?? 0;

  // Per-night prices for the selected range: real prices from availability
  // (already markup-applied by lib/data/availability — the SAME lib/pricing
  // math /api/quote charges), else the flat listing rate. Sum drives the total,
  // so the per-night lines in the price-details popup add up to it EXACTLY —
  // they ARE the numbers the subtotal is built from, not a re-derivation.
  // Checkout re-quotes live Hostaway and flags any cache drift (M1.1.6).
  const stayNights = useMemo(() => {
    if (!startDate || nights === 0) return [] as Array<{ key: string; label: string; ron: number }>;
    const out: Array<{ key: string; label: string; ron: number }> = [];
    const cur = new Date(startDate);
    for (let i = 0; i < nights; i += 1) {
      const key = ymd(cur);
      out.push({
        key,
        label: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ron: availability?.[key]?.ron ?? rate.perNight,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [availability, startDate, nights, rate.perNight]);

  const staySubtotal = stayNights.reduce((a, n) => a + n.ron, 0);
  const isVariablePricing = new Set(stayNights.map((n) => n.ron)).size > 1;

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
    // Per-stay cleaning fee (RON) — mirrors lib/booking/quote so the displayed
    // total equals the server charge. Breakdown order: accommodation →
    // extra services → cleaning → city tax (M1.1.5).
    const cleaning = property.cleaningRon;
    // Member stay price = sum of per-night prices (variable from availability,
    // else flat rate.perNight × nights).
    const mainRoomTotal = staySubtotal + breakfastTotal + cleaning + mainCityTax;

    // Added rooms keep the flat rate × nights + cleaning + city tax (no per-room calendar).
    const addedRoomsTotal = addedRooms.reduce((sum, sib) => {
      const pn = siblingPerNight(sib)!;
      return sum + pn * nights + sib.cleaningRon + CITY_TAX_PER_PERSON * nights * occupants;
    }, 0);

    const combinedTotal = mainRoomTotal + addedRoomsTotal;

    return {
      staySubtotal,
      breakfastTotal,
      cleaning,
      cityTax: mainCityTax,
      total: mainRoomTotal,
      combinedTotal,
      occupants,
    };
  }, [staySubtotal, nights, guests, upgrades, addedRooms, breakfastPrice, property.cleaningRon]);

  // RON total actually charged — combinedTotal only applies once multi-room
  // re-enables (roomCount stays 1 in practice while MULTI_ROOM_ENABLED is false).
  const effectiveTotal = roomCount > 1 && MULTI_ROOM_ENABLED ? pricing.combinedTotal : pricing.total;

  function book() {
    if (!startDate || !endDate || nights === 0) {
      setShowCal(true);
      return;
    }
    if (exceedsMaxNights) return;
    const booking: Booking = {
      propertyId: property.id,
      checkIn: ymd(startDate),
      checkOut: ymd(endDate),
      nights,
      guests,
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
      : exceedsMaxNights
        ? `Max ${MAX_NIGHTS} nights`
        : !loggedIn
          ? 'Sign up & book →'
          : roomCount > 1 && MULTI_ROOM_ENABLED
            ? `Book ${roomCount} rooms →`
            : 'Book best rate →';

  // Mobile (<768px): the fixed bar duplicates the booking box's total + CTA,
  // so hide it while the box itself is on screen. Hysteresis: hide once ≥15%
  // of the box is visible, show again only when it is fully gone — the dead
  // zone between the two thresholds stops flicker at the boundary. The
  // negative bottom rootMargin discounts the strip the fixed bar itself
  // covers, so "visible" means visible ABOVE the bar.
  const boxRef = useRef<HTMLElement | null>(null);
  const [boxOnScreen, setBoxOnScreen] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.15) setBoxOnScreen(true);
        else if (!entry.isIntersecting) setBoxOnScreen(false);
      },
      { threshold: [0, 0.15], rootMargin: '0px 0px -96px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mobileBar = mounted
    ? createPortal(
        <MobileBookingBar
          hidden={boxOnScreen}
          priceLabel={nights === 0 ? 'From' : 'Total'}
          priceValue={mobileBarPrice}
          taxNote={
            nights === 0
              ? '/night · Select dates'
              : `${nights} night${nights === 1 ? '' : 's'} · taxes & charges incl.`
          }
          ctaLabel={ctaLabel}
          onBook={book}
        />,
        document.body,
      )
    : null;

  // Tablet/desktop (≥768px): slim top bar once the sidebar's Book button has
  // scrolled out of view (Spec M1.5.1). Same numbers as the sidebar — it reads
  // the values computed above rather than recomputing any pricing.
  const bookBtnRef = useRef<HTMLButtonElement | null>(null);
  const [bookBtnVisible, setBookBtnVisible] = useState(true);
  useEffect(() => {
    const el = bookBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBookBtnVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stickyBar = mounted
    ? createPortal(
        <StickyBookingBar
          show={!bookBtnVisible}
          propertyName={property.name}
          datesLabel={
            startDate && endDate
              ? `${formatDate(startDate)} – ${formatDate(endDate)}`
              : 'Select dates'
          }
          priceLabel={nights === 0 ? 'From' : 'Total'}
          priceValue={mobileBarPrice}
          note={
            nights === 0
              ? 'per night'
              : `${nights} night${nights === 1 ? '' : 's'} · taxes & charges incl.`
          }
          ctaLabel={ctaLabel}
          onBook={() => {
            // No dates yet → send the guest to the sidebar to pick them;
            // otherwise go straight to checkout like the sidebar button.
            if (nights === 0) {
              bookBtnRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            book();
          }}
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
                onSelect={selectRange}
                onClose={() => setShowCal(false)}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
    <aside ref={boxRef} className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto rounded-card border border-gray-line bg-white p-6 shadow-[var(--shadow-pill)]">
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] text-gold-dark">{format(rate.perNight)}</span>
        <span className="text-sm text-ink-60">/night</span>
      </div>
      <p className="text-[11px] text-ink-60">11% VAT included</p>
      {/* Cleaning fee: per-stay, real RON (charged as such) + ≈ display equivalent */}
      <p className="mb-4 mt-0.5 text-[11px] text-ink-60">
        Cleaning fee {property.cleaningRon} RON
        {approx(property.cleaningRon) ? ` (${approx(property.cleaningRon)})` : ''} — not
        included in the nightly rate
      </p>

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
            onSelect={selectRange}
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
            maxOccupants={property.maxGuests}
          />
        </div>
      )}

      {/* Cancellation — a membership right, not a rate tier (DX7). Copy from
          lib/policies so it can never drift from the published policy. */}
      <div className="mt-4 rounded-2xl border border-gray-line p-4">
        <p className="font-mono-label mb-2 text-ink-60">Cancellation</p>
        <ul className="space-y-1 text-xs text-ink-80">
          {CANCELLATION_POLICY.memberTiers.map((tier) => (
            <li key={tier} className="flex items-start gap-2">
              <Icon name="check" size={12} className="mt-0.5 text-gold-dark" />
              {tier}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs font-semibold text-gold-dark">
          {CANCELLATION_POLICY.cityTax}
        </p>
        <p className="mt-1 text-xs text-ink-60">{CANCELLATION_POLICY.nonMember}</p>
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
              {/* Accommodation — ONE total-price line, never the 18%/3% split —
                  expandable into per-night prices (M1.1.6). The lines are the
                  exact numbers staySubtotal is summed from (same lib/pricing
                  math as /api/quote); checkout re-quotes live and flags drift.
                  RON-real per line (the charged money) + ≈ display equivalent,
                  mirroring the checkout BookingSummary breakdown. */}
              <li>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                    <span>
                      Accommodation · {nights} night{nights === 1 ? '' : 's'}
                      <span className="ml-1 text-xs text-ink-60 underline decoration-dotted group-open:hidden">
                        per night
                      </span>
                    </span>
                    <span>{format(pricing.staySubtotal)}</span>
                  </summary>
                  <ul className="mt-2 space-y-1 border-l border-gray-line pl-3 text-xs text-ink-60">
                    {stayNights.map((n) => (
                      <li key={n.key} className="flex items-center justify-between gap-3">
                        <span>{n.label}</span>
                        <span>
                          {n.ron.toLocaleString('en-US')} RON
                          {approx(n.ron) && <span className="ml-1">({approx(n.ron)})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
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
              <Row label="Cleaning fee" value={format(pricing.cleaning)} />
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
            <p className="mt-1 text-right text-[11px] text-ink-60">11% VAT included</p>
          </div>
        </div>
      )}

      {/* Server (lib/booking/quote.ts) rejects stays over MAX_NIGHTS — flag it
          here so a long range doesn't dead-end the guest at checkout. */}
      {exceedsMaxNights && (
        <p className="mt-4 rounded-2xl border border-gold bg-gold-pale px-4 py-3 text-xs text-ink-80">
          Stays are limited to {MAX_NIGHTS} nights —{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold underline underline-offset-[3px]"
          >
            contact us
          </a>{' '}
          for longer stays.
        </p>
      )}

      <button
        ref={bookBtnRef}
        type="button"
        onClick={book}
        disabled={exceedsMaxNights}
        className={cn(
          'mt-5 w-full rounded-full bg-ink py-3 text-center font-semibold text-cream transition hover:bg-gold hover:text-ink',
          exceedsMaxNights && 'cursor-not-allowed opacity-40 hover:bg-ink hover:text-cream',
        )}
      >
        {ctaLabel}
      </button>

      <p className="mt-3 text-center text-[11px] text-ink-60">
        You won&apos;t be charged yet
      </p>
    </aside>
    {mobileBar}
    {stickyBar}
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
