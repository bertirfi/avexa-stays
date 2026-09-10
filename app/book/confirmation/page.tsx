import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getPropertyData } from '@/lib/data/properties';
import {
  BookingConfirmedEffects,
  ConfirmationPoller,
} from '@/components/checkout/ConfirmationPoller';

export const metadata: Metadata = {
  title: 'Booking confirmation',
  description: 'Your AVEXA booking status.',
  robots: { index: false, follow: false },
};

// Always reflect the live booking status (webhook may flip it any second).
export const dynamic = 'force-dynamic';

function formatRon(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} RON`;
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) redirect('/');

  const {
    data: { user },
  } = await (await getSupabaseServerClient()).auth.getUser();

  // Service-role read by Stripe session id, then an ownership check
  // (RLS-equivalent): a member row must match the signed-in user; a guest row
  // (user_id NULL, no account to sign into) is keyed by the session id alone —
  // `cs_…` ids are Stripe-issued, high-entropy and only ever handed to the
  // payer, so the link itself is the bearer, exactly like the email receipt.
  const { data: found } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  if (found && found.user_id !== null && !user) redirect('/login?next=%2Fmy-trips');
  const booking = found && (found.user_id === null || found.user_id === user?.id) ? found : null;
  const guest = booking?.user_id === null;

  const property = booking ? await getPropertyData(booking.property_id) : null;

  // Display equivalent in the currency the guest was browsing in (charge is RON).
  const equivalent =
    booking && booking.display_currency !== 'RON' && booking.display_fx_rate
      ? `≈ ${booking.display_currency === 'EUR' ? '€' : '$'}${(
          Number(booking.total_ron) / Number(booking.display_fx_rate)
        ).toFixed(2)}`
      : null;

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-cream px-6 py-24">
      <div className="w-full max-w-xl rounded-2xl border border-ink/10 bg-white p-8 shadow-sm md:p-10">
        {!booking ? (
          <>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              We can&apos;t find that booking
            </h1>
            <p className="mt-3 text-ink/70">
              The confirmation link is invalid or belongs to a different account.
            </p>
            <Link
              href={user ? '/my-trips' : '/'}
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-ink/85"
            >
              {user ? 'Go to My Trips' : 'Back to home'}
            </Link>
          </>
        ) : booking.status === 'confirmed' ? (
          <>
            <BookingConfirmedEffects />
            <p className="font-mono-label text-[10px] uppercase tracking-widest text-gold-dark">
              Booking confirmed
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-ink md:text-3xl">
              {property?.name ?? 'Your AVEXA suite'} is yours.
            </h1>
            <dl className="mt-6 space-y-3 border-t border-ink/10 pt-6 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Dates</dt>
                <dd className="font-medium text-ink">
                  {booking.check_in} → {booking.check_out}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Guests</dt>
                <dd className="font-medium text-ink">{booking.guests}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">Total paid</dt>
                <dd className="text-right font-medium text-ink">
                  {formatRon(Number(booking.total_ron))}
                  {equivalent ? (
                    <span className="block text-[12px] font-normal text-ink/50">
                      {equivalent}
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-[12px] text-ink/50">
              11% VAT included · Check-in details arrive by email before your stay.
            </p>
            {guest && (
              <p className="mt-2 text-[12px] text-ink/50">
                Guest booking — your confirmation email is your booking record.
              </p>
            )}
            <Link
              href={guest ? '/locations' : '/my-trips'}
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-ink/85"
            >
              {guest ? 'Explore more stays' : 'View my trips'}
            </Link>
          </>
        ) : booking.status === 'cancelled' ? (
          <>
            <h1 className="font-display text-2xl font-extrabold text-ink">
              Payment received — but the dates were just taken
            </h1>
            <p className="mt-3 leading-relaxed text-ink/70">
              <span className="block">
                Another guest booked these dates moments before your payment completed.
              </span>
              <span className="block">
                <strong className="text-ink">You have been refunded in full</strong>{' '}
                ({formatRon(Number(booking.total_ron))}) — depending on your bank,
                it appears within 5–10 business days.
              </span>
              <span className="block">
                We&apos;re sorry; the city is still yours on other dates.
              </span>
            </p>
            <Link
              href={property ? `/locations/${property.slug}` : '/locations'}
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-display text-sm font-bold text-cream transition hover:bg-ink/85"
            >
              Pick new dates
            </Link>
          </>
        ) : (
          // The poller owns the whole pending presentation: it pulses while the
          // webhook lands, then swaps to a calm fallback instead of looping forever.
          <ConfirmationPoller guest={guest} />
        )}
      </div>
    </main>
  );
}
