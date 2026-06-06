'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import type { HydratedBooking } from '@/lib/booking';
import type { ContactForm } from '@/components/checkout/ContactInfoStep';
import { cn } from '@/lib/cn';

interface Props {
  hydrated: HydratedBooking;
  form: ContactForm;
  onBack: () => void;
  onNext: () => void;
}

export function PaymentStep({ hydrated, form, onBack, onNext }: Props) {
  const isBiz = form.accountType === 'business';
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [method, setMethod] = useState<'card' | 'apple' | 'google'>('card');

  const total = hydrated.raw.total.toFixed(2);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">Payment</h1>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-ink-60">Amount to be paid</p>
          <p className="font-display text-4xl">€ {total}</p>
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
              This stay will be invoiced to {form.companyName || 'your company'}. Pay with the company card so your records stay aligned.
            </span>
          </div>
        </div>
      )}

      <div className="rounded-card border border-gray-line p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-gray-line pb-3">
          <RadioDot active={method === 'card'} onClick={() => setMethod('card')} />
          <Icon name="sparkles" size={18} className="text-gold-dark" />
          <span className="font-semibold">Card</span>
          <div className="ml-auto flex items-center gap-2">
            {['VISA', 'MC', 'AMEX'].map((b) => (
              <span
                key={b}
                className="rounded-md border border-gray-line px-2 py-0.5 text-[10px] font-semibold tracking-wider"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <Field label="Cardholder name">
          <input
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Jordan Smith"
            required={method === 'card'}
            className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition placeholder:text-ink-60/60 focus:border-ink focus:outline-none"
          />
        </Field>
        <Field label="Card number">
          <input
            value={cardNum}
            onChange={(e) => setCardNum(e.target.value)}
            placeholder="1234 1234 1234 1234"
            maxLength={19}
            required={method === 'card'}
            className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition placeholder:text-ink-60/60 focus:border-ink focus:outline-none"
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Expiry date">
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              required={method === 'card'}
              className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition placeholder:text-ink-60/60 focus:border-ink focus:outline-none"
            />
          </Field>
          <Field label="Security code">
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="CVV"
              maxLength={4}
              required={method === 'card'}
              className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition placeholder:text-ink-60/60 focus:border-ink focus:outline-none"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-2">
        <AltPay
          active={method === 'apple'}
          label="Apple Pay"
          badge="Pay"
          badgeStyle="bg-ink text-cream"
          onClick={() => setMethod('apple')}
        />
        <AltPay
          active={method === 'google'}
          label="Google Pay"
          badge="G Pay"
          badgeStyle="bg-white border border-gray-line text-ink"
          onClick={() => setMethod('google')}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-line px-6 py-3 text-sm font-semibold transition hover:border-ink"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 font-semibold text-cream transition hover:bg-gold hover:text-ink"
        >
          <Icon name="shield" size={16} /> Pay € {total}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block last:mb-0">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function RadioDot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Select payment method"
      className={cn(
        'grid size-5 place-items-center rounded-full border-2',
        active ? 'border-ink' : 'border-gray-line',
      )}
    >
      {active && <span className="size-2.5 rounded-full bg-ink" />}
    </button>
  );
}

function AltPay({
  active,
  label,
  badge,
  badgeStyle,
  onClick,
}: {
  active: boolean;
  label: string;
  badge: string;
  badgeStyle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition',
        active ? 'border-ink bg-cream' : 'border-gray-line hover:border-ink',
      )}
    >
      <RadioDot active={active} onClick={onClick} />
      <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', badgeStyle)}>{badge}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
