'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/checkout/Stepper';
import { BookingSummary } from '@/components/checkout/BookingSummary';
import { ContactInfoStep, type ContactForm } from '@/components/checkout/ContactInfoStep';
import { GuestContactStep } from '@/components/checkout/GuestContactStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { hydrate, readBooking, type HydratedBooking } from '@/lib/booking';
import type { QuoteBreakdown } from '@/lib/booking/schema';

/** Server-derived contact prefill (from the validated Supabase session). */
export interface InitialContact {
  fullName: string;
  email: string;
}

// Step 3 (confirmation) lives on /book/confirmation — Stripe redirects there.
type Step = 1 | 2;

/**
 * Server-quote lifecycle. The checkout page renders money from THIS (the same
 * live Hostaway quote /api/checkout charges), never from the localStorage draft.
 */
export type QuoteState =
  | { status: 'quoting' }
  | { status: 'quoted'; quote: QuoteBreakdown }
  | { status: 'unavailable' }
  | { status: 'error' };

const emptyForm = (): ContactForm => ({
  firstName: '',
  lastName: '',
  email: '',
  prefix: '+40',
  phone: '',
  street: '',
  city: '',
  country: '',
  accountType: 'individual',
  bookFor: 'self',
  companyName: '',
  vatNumber: '',
  regNumber: '',
  companyStreet: '',
  companyCity: '',
  companyCountry: '',
});

export function CheckoutApp({
  initialContact,
  guest = false,
}: {
  initialContact: InitialContact;
  /** No server session (client decision 04.09): show the member/guest gate first. */
  guest?: boolean;
}) {
  const [hydrated, setHydrated] = useState<HydratedBooking | null>(null);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [guestChosen, setGuestChosen] = useState(false);
  const [quoteState, setQuoteState] = useState<QuoteState>({ status: 'quoting' });
  const [form, setForm] = useState<ContactForm>(() => {
    // Prefill name/email from the server-validated session (first word = first
    // name, remainder = last name). The rest of the form fills client-side.
    const [firstName, ...rest] = initialContact.fullName.split(/\s+/).filter(Boolean);
    return {
      ...emptyForm(),
      firstName: firstName ?? '',
      lastName: rest.join(' '),
      email: initialContact.email,
    };
  });

  // Read the booking draft from localStorage on mount (UI-only optimistic cache).
  useEffect(() => {
    setMounted(true);
    const b = readBooking();
    if (b) setHydrated(hydrate(b));
  }, []);

  // Fetch the AUTHORITATIVE quote once the draft is hydrated. This — not the
  // localStorage numbers — is the money the page shows and the amount charged.
  const fetchQuote = useCallback(async (b: HydratedBooking) => {
    setQuoteState({ status: 'quoting' });
    const { raw } = b;
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: raw.propertyId,
          checkIn: raw.checkIn,
          checkOut: raw.checkOut,
          adults: raw.guests.adults,
          children: raw.guests.children,
          infants: raw.guests.infants,
          breakfast: Boolean(raw.upgrades?.breakfast),
        }),
      });
      if (res.status === 409) {
        setQuoteState({ status: 'unavailable' });
        return;
      }
      if (!res.ok) {
        setQuoteState({ status: 'error' });
        return;
      }
      const quote = (await res.json()) as QuoteBreakdown;
      setQuoteState({ status: 'quoted', quote });
    } catch {
      setQuoteState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (hydrated) void fetchQuote(hydrated);
  }, [hydrated, fetchQuote]);

  // Scroll to top on step change
  useEffect(() => {
    if (mounted) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, mounted]);

  if (!mounted) return <SkeletonShell />;

  if (!hydrated) return <NoBookingGate />;

  if (quoteState.status === 'unavailable') {
    return <UnavailableGate slug={hydrated.property.slug} />;
  }

  if (guest && !guestChosen) {
    return <GuestEntryGate onGuest={() => setGuestChosen(true)} />;
  }

  return (
    <>
      <Stepper step={step} />
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <section className="rounded-card border border-gray-line bg-white p-6 md:p-10">
            {step === 1 &&
              (guest ? (
                <GuestContactStep form={form} setForm={setForm} onNext={() => setStep(2)} />
              ) : (
                <ContactInfoStep form={form} setForm={setForm} onNext={() => setStep(2)} />
              ))}
            {step === 2 && (
              <PaymentStep
                hydrated={hydrated}
                form={form}
                quoteState={quoteState}
                onBack={() => setStep(1)}
                guest={guest}
              />
            )}
          </section>

          <div className="lg:min-w-0">
            {quoteState.status === 'error' ? (
              <QuoteErrorRetry onRetry={() => void fetchQuote(hydrated)} />
            ) : (
              <BookingSummary hydrated={hydrated} quoteState={quoteState} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Gates ───────────────────────────────────────────────────────── */

/** Signed-out visitors choose: member (sign in / join free) or guest. */
function GuestEntryGate({ onGuest }: { onGuest: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 md:py-28">
      <p className="font-mono-label text-gold-dark">— Checkout</p>
      <h1 className="font-display mt-3 text-3xl md:text-4xl">Member or guest?</h1>
      <p className="mt-3 text-ink-80">
        <span className="block">Same apartment, same price either way.</span>
        <span className="block">Members keep the right to cancel and earn AVEXA Coins on this stay.</span>
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-card border border-gold/40 bg-gold-pale/40 p-6">
          <span className="font-mono-label text-gold-dark">Recommended</span>
          <h2 className="font-display mt-2 text-xl">Sign in / Join free</h2>
          <ul className="mt-3 flex-1 space-y-1.5 text-sm text-ink-80">
            {[
              'Flexible cancellation — members only',
              'Earn AVEXA Coins on every stay',
              'Every trip in My Trips',
            ].map((perk) => (
              <li key={perk} className="flex items-start gap-2">
                <Icon name="check" size={14} className="mt-0.5 shrink-0 text-gold-dark" />
                {perk}
              </li>
            ))}
          </ul>
          <Link
            href="/login?next=%2Fcheckout"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink"
          >
            Sign in / Join free →
          </Link>
        </div>

        <div className="flex flex-col rounded-card border border-gray-line bg-white p-6">
          <span className="font-mono-label text-ink-60">No account</span>
          <h2 className="font-display mt-2 text-xl">Continue as guest</h2>
          <p className="mt-3 flex-1 text-sm text-ink-80">
            <span className="block">Name, email, phone.</span>
            <span className="block">Non-refundable, no coins, no My Trips.</span>
          </p>
          <button
            type="button"
            onClick={onGuest}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-gray-line px-6 py-3 font-semibold text-ink transition hover:border-ink"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}

function NoBookingGate() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-2xl bg-cream">
        <Icon name="calendar" size={32} className="text-ink-60" />
      </div>
      <h2 className="font-display text-3xl">No active booking</h2>
      <p className="mt-3 text-ink-80">
        Pick a suite and dates first, then come back here to complete checkout.
      </p>
      <Link
        href="/locations"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Browse stays →
      </Link>
    </div>
  );
}

function UnavailableGate({ slug }: { slug: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-2xl bg-cream">
        <Icon name="calendar" size={32} className="text-ink-60" />
      </div>
      <h2 className="font-display text-3xl">These dates are no longer available</h2>
      <p className="mt-3 text-ink-80">
        <span className="block">Someone just booked this suite for your dates.</span>
        <span className="block">
          Nothing was charged — pick new dates and you&apos;re a couple of clicks
          from the city again.
        </span>
      </p>
      <Link
        href={`/locations/${slug}`}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Pick new dates →
      </Link>
    </div>
  );
}

function QuoteErrorRetry({ onRetry }: { onRetry: () => void }) {
  return (
    <aside className="rounded-card border border-gray-line bg-white p-6 text-center shadow-[var(--shadow-pill)]">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-cream">
        <Icon name="info" size={20} className="text-ink-60" />
      </div>
      <p className="font-semibold text-ink">We couldn&apos;t load your price</p>
      <p className="mt-1.5 text-sm text-ink-60">
        <span className="block">Something interrupted the connection.</span>
        <span className="block">Your dates are still held — try again.</span>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Retry
      </button>
    </aside>
  );
}

function SkeletonShell() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-32 md:px-10">
      <div className="h-8 w-48 animate-pulse rounded-full bg-gray-light" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="h-96 animate-pulse rounded-card bg-gray-light" />
        <div className="h-80 animate-pulse rounded-card bg-gray-light" />
      </div>
    </div>
  );
}
