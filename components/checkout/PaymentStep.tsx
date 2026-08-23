'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import type { HydratedBooking } from '@/lib/booking';
import type { ContactForm } from '@/components/checkout/ContactInfoStep';
import type { QuoteState } from '@/components/checkout/CheckoutApp';
import { useCurrency } from '@/components/currency/CurrencyProvider';

interface Props {
  hydrated: HydratedBooking;
  form: ContactForm;
  /** Authoritative server quote — the amount shown here and charged. */
  quoteState: QuoteState;
  onBack: () => void;
}

type PayState =
  | { status: 'idle' }
  | { status: 'redirecting' }
  | { status: 'error'; message: string; unavailable?: boolean };

/**
 * Final step before Stripe. No card fields here — Stripe Checkout hosts the
 * payment page (cards, Apple Pay, Google Pay, 3DS). This step only sends the
 * booking parameters + contact to /api/checkout, which re-derives the price
 * server-side and returns the Stripe session URL. The client never sends a
 * price.
 */
export function PaymentStep({ hydrated, form, quoteState, onBack }: Props) {
  const isBiz = form.accountType === 'business';
  const { currency, format } = useCurrency();
  const [state, setState] = useState<PayState>({ status: 'idle' });

  const raw = hydrated.raw;
  // Money shown MUST be the authoritative server quote (never the draft). Until
  // it lands, the amount reads as a skeleton and Pay stays disabled.
  const quote = quoteState.status === 'quoted' ? quoteState.quote : null;
  const totalRon = quote?.totalRon ?? null;
  const totalDisplay = totalRon !== null ? format(totalRon) : null;

  async function pay() {
    setState({ status: 'redirecting' });
    try {
      const res = await fetch('/api/checkout', {
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
          displayCurrency: currency,
          contact: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email.trim(),
            phone: form.phone ? `${form.prefix} ${form.phone}`.trim() : undefined,
            invoiceCompany: isBiz && form.companyName ? form.companyName : undefined,
            invoiceVat: isBiz && form.vatNumber ? form.vatNumber : undefined,
            invoiceRegCom: isBiz && form.regNumber ? form.regNumber : undefined,
            invoiceAddress: isBiz
              ? [form.companyStreet, form.companyCity, form.companyCountry]
                  .filter(Boolean)
                  .join(', ') || undefined
              : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setState({ status: 'error', message: 'Payment could not be started. Please try again.' });
        return;
      }
      if (res.status === 401) {
        window.location.href = '/login?next=/checkout';
        return;
      }
      if (res.status === 409) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (data?.error === 'already_processing') {
          setState({
            status: 'error',
            message:
              'A payment for this stay is already processing — check My Trips in a moment before paying again.',
          });
          return;
        }
        setState({
          status: 'error',
          unavailable: true,
          message: 'These dates were just booked by another guest — nothing was charged.',
        });
        return;
      }
      setState({ status: 'error', message: 'Payment could not be started. Please try again in a moment.' });
    } catch {
      setState({ status: 'error', message: 'Network error — check your connection and try again.' });
    }
  }

  // Pay is blocked until the authoritative quote is in hand (quoting/unavailable/
  // error) and while redirecting — we never send the guest to Stripe on a price
  // we haven't confirmed server-side this session.
  const busy = state.status === 'redirecting';
  const canPay = quote !== null && !busy;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">Payment</h1>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-ink-60">Amount to be paid</p>
          {totalDisplay !== null && totalRon !== null ? (
            <>
              <p className="font-display text-4xl">{totalDisplay}</p>
              {currency !== 'RON' && (
                <p className="mt-1 text-xs text-ink-60">
                  charged as {totalRon.toLocaleString('en-US')} RON
                </p>
              )}
              <p className="mt-0.5 text-xs text-ink-60">11% VAT included</p>
            </>
          ) : (
            <span className="mt-1 block h-10 w-40 animate-pulse rounded-lg bg-gray-light" />
          )}
        </div>
        <span className="font-mono-label flex items-center gap-1.5 text-gold-dark">
          <Icon name="shield" size={14} /> Secure Payment
        </span>
      </div>

      {isBiz && (
        <div className="flex items-start gap-3 rounded-card border border-gold/30 bg-gold-pale/40 p-4 text-sm">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-gold-dark" />
          <div>
            <strong className="block text-ink">Remember to use your Business card</strong>
            <span className="text-ink-80">
              This stay will be invoiced to {form.companyName || 'your company'}. Pay with the
              company card so your records stay aligned.
            </span>
          </div>
        </div>
      )}

      <div className="rounded-card border border-gray-line p-5">
        <div className="flex items-start gap-3">
          <Icon name="sparkles" size={18} className="mt-0.5 shrink-0 text-gold-dark" />
          <div className="text-sm text-ink-80">
            <strong className="block text-ink">You&apos;ll finish on Stripe&apos;s secure page</strong>
            Cards, Apple Pay and Google Pay are all supported there. We never see or store your
            card details — payment is handled entirely by Stripe.
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-gray-line pt-4">
          {['VISA', 'MC', 'AMEX', 'Apple Pay', 'G Pay'].map((b) => (
            <span
              key={b}
              className="rounded-md border border-gray-line px-2 py-0.5 text-[10px] font-semibold tracking-wider text-ink-80"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {state.status === 'error' && (
        <div className="flex items-start gap-3 rounded-card border border-red-300 bg-red-50 p-4 text-sm" role="alert">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <span className="block text-ink">{state.message}</span>
            {state.unavailable && (
              <Link href="/locations" className="mt-1 inline-block font-semibold text-gold-dark underline">
                Pick new dates →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="rounded-full border border-gray-line px-6 py-3 text-sm font-semibold transition hover:border-ink disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={pay}
          disabled={!canPay}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-70"
        >
          <Icon name="shield" size={16} />
          {busy
            ? 'Redirecting to secure payment…'
            : quote === null
              ? 'Confirming price…'
              : `Pay ${totalDisplay}`}
        </button>
      </div>
    </div>
  );
}
