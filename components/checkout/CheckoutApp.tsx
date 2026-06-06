'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/checkout/Stepper';
import { BookingSummary } from '@/components/checkout/BookingSummary';
import { ContactInfoStep, type ContactForm } from '@/components/checkout/ContactInfoStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import {
  hydrate,
  readBooking,
  readUser,
  type HydratedBooking,
} from '@/lib/booking';

type Step = 1 | 2 | 3;

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

export function CheckoutApp() {
  const [hydrated, setHydrated] = useState<HydratedBooking | null>(null);
  const [user, setUser] = useState<{ loggedIn: boolean; email?: string; firstName?: string; lastName?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ContactForm>(() => emptyForm());

  // Read localStorage on mount
  useEffect(() => {
    setMounted(true);
    const u = readUser();
    setUser(u);
    const b = readBooking();
    if (b) setHydrated(hydrate(b));

    // Pre-fill form from logged-in user
    if (u?.loggedIn) {
      setForm((prev) => ({
        ...prev,
        firstName: u.firstName ?? prev.firstName,
        lastName: u.lastName ?? prev.lastName,
        email: u.email ?? prev.email,
      }));
    }
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    if (mounted) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, mounted]);

  if (!mounted) return <SkeletonShell />;

  if (!user?.loggedIn) return <AuthGate />;

  if (!hydrated) return <NoBookingGate />;

  return (
    <>
      <Stepper step={step} />
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <section className="rounded-card border border-gray-line bg-white p-6 md:p-10">
            {step === 1 && (
              <ContactInfoStep form={form} setForm={setForm} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
              <PaymentStep
                hydrated={hydrated}
                form={form}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && <ConfirmationStep hydrated={hydrated} />}
          </section>

          {step < 3 && (
            <div className="lg:min-w-0">
              <BookingSummary hydrated={hydrated} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Gates ───────────────────────────────────────────────────────── */

function AuthGate() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <div className="mb-6 grid size-20 place-items-center rounded-2xl bg-gold-pale">
        <Icon name="key" size={32} className="text-gold-dark" />
      </div>
      <h2 className="font-display text-3xl">Sign in to book</h2>
      <p className="mt-3 text-ink-80">
        Log in or create a free account to complete your reservation. Your member discount will be applied automatically.
      </p>
      <Link
        href="/login?next=/checkout"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Log in or sign up →
      </Link>
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
