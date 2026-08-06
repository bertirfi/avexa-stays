import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { freeCancelDeadlineMs, isFreeCancellable } from '@/lib/booking/cancellation';
import { properties } from '@/lib/properties';
import { EmptyTripsState } from '@/components/trips/EmptyTripsState';
import { TripsList, type Trip } from '@/components/trips/TripsList';
import { MosaicSection } from '@/components/trips/MosaicSection';
import { ContactSection } from '@/components/trips/ContactSection';

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'Your upcoming and past AVEXA stays.',
  robots: { index: false, follow: false },
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Parse a 'YYYY-MM-DD' string into numeric parts WITHOUT `new Date(str)`
 *  (which would parse as UTC midnight and shift the day in negative offsets). */
function parseYmdParts(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

/** Fixed-locale "Nov 3 – Nov 5, 2026" from two 'YYYY-MM-DD' strings. */
function formatDatesLabel(checkIn: string, checkOut: string): string {
  const a = parseYmdParts(checkIn);
  const b = parseYmdParts(checkOut);
  const left = `${MONTHS_SHORT[a.m - 1]} ${a.d}`;
  const right = `${MONTHS_SHORT[b.m - 1]} ${b.d}`;
  // Year taken from check-out (stays never cross into a third year in practice).
  return `${left} – ${right}, ${b.y}`;
}

/** Whole-night difference between two 'YYYY-MM-DD' strings via UTC math. */
function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseYmdParts(checkIn);
  const b = parseYmdParts(checkOut);
  const ms = Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d);
  return Math.max(0, Math.round(ms / 86_400_000));
}

/** "2 adults" / "2 adults · 1 child" / "… · 1 infant" — correct singular/plural. */
function formatGuestsLabel(adults: number, children: number, infants: number): string {
  const parts: string[] = [`${adults} ${adults === 1 ? 'adult' : 'adults'}`];
  if (children > 0) parts.push(`${children} ${children === 1 ? 'child' : 'children'}`);
  if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'infant' : 'infants'}`);
  return parts.join(' · ');
}

const CURRENCY_SYMBOL: Record<string, string> = { EUR: '€', USD: '$', RON: 'RON' };

/** "≈ €420" from the booking's own historical FX rate, or null when charged in RON. */
function formatApproxLabel(
  totalRon: number,
  displayCurrency: string,
  fxRate: number | null,
): string | null {
  if (displayCurrency === 'RON' || !fxRate || fxRate <= 0) return null;
  const symbol = CURRENCY_SYMBOL[displayCurrency] ?? '';
  const amount = Math.round(totalRon / fxRate).toLocaleString('en-US');
  return `≈ ${symbol}${amount}`;
}

export default async function MyTripsPage() {
  const user = await requireUser('/my-trips');

  // Session-scoped client: RLS `bookings_select_own` restricts rows to this
  // user — no explicit user_id filter needed, and the admin client is wrong here.
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('bookings')
    .select(
      'id, property_id, status, check_in, check_out, adults, children, infants, total_ron, display_currency, display_fx_rate, order_id, rate_plan, hostaway_reservation_id',
    )
    .order('check_in', { ascending: false });

  const rows = data ?? [];

  const trips: Trip[] = rows.map((b) => {
    const property = properties.find((p) => p.id === b.property_id);
    const totalRon = Math.round(Number(b.total_ron));
    // The action re-checks this server-side at cancel time — here it only
    // decides whether the button renders (and the page is SSR per-request,
    // so "now" is honest, not a stale build-time value).
    const cancellable = isFreeCancellable(b);
    return {
      id: b.id,
      orderId: b.order_id,
      propertyName: property?.name ?? `AVEXA Suite ${b.property_id}`,
      propertySubtitle: property?.subtitle ?? '',
      // Unknown property → link to the locations index rather than a dead slug.
      propertySlug: property?.slug ?? '',
      cover: property?.cover ?? null,
      neighborhoodLabel: property?.neighborhoodLabel ?? '',
      datesLabel: formatDatesLabel(b.check_in, b.check_out),
      nightsLabel: (() => {
        const n = nightsBetween(b.check_in, b.check_out);
        return `${n} ${n === 1 ? 'night' : 'nights'}`;
      })(),
      guestsLabel: formatGuestsLabel(b.adults, b.children, b.infants),
      totalLabel: `${totalRon.toLocaleString('en-US')} RON`,
      approxLabel: formatApproxLabel(totalRon, b.display_currency, b.display_fx_rate),
      status: b.status,
      cancellable,
      cancelDeadlineLabel: cancellable
        ? new Intl.DateTimeFormat('en-US', {
            timeZone: 'Europe/Bucharest',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(freeCancelDeadlineMs(b.check_in)))
        : null,
    };
  });

  // "Today" as a 'YYYY-MM-DD' string in Bucharest time, for the upcoming/past split.
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Bucharest',
  }).format(new Date());

  const upcoming: Trip[] = [];
  const past: Trip[] = [];
  rows.forEach((b, i) => {
    const trip = trips[i];
    if (b.status === 'confirmed' && b.check_out >= today) upcoming.push(trip);
    else past.push(trip);
  });

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0] ||
    user.email?.split('@')[0] ||
    'there';

  return (
    <>
      {trips.length === 0 ? (
        <EmptyTripsState name={firstName} />
      ) : (
        <TripsList name={firstName} upcoming={upcoming} past={past} />
      )}
      <MosaicSection />
      <ContactSection />
    </>
  );
}
