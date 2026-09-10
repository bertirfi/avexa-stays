'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Field,
  Hint,
  Input,
  type ContactForm,
} from '@/components/checkout/ContactInfoStep';
import { GuestContactSchema } from '@/lib/booking/schema';

interface Props {
  form: ContactForm;
  setForm: React.Dispatch<React.SetStateAction<ContactForm>>;
  onNext: () => void;
}

type GuestField = 'name' | 'email' | 'phone';

/**
 * Guest checkout contact step (client decision 04.09): name + email + phone,
 * nothing else — no address, no business invoice, no account. Validated with
 * the SAME Zod schema /api/checkout enforces server-side for session-less
 * requests (lib/booking/schema GuestContactSchema). Writes into the shared
 * ContactForm so PaymentStep's payload builder is untouched.
 */
export function GuestContactStep({ form, setForm, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<GuestField, string>>>({});
  const set =
    <K extends keyof ContactForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as ContactForm[K] }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Compose exactly what PaymentStep sends, so client and server judge the
    // same strings.
    const result = GuestContactSchema.safeParse({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email.trim(),
      phone: form.phone ? `${form.prefix} ${form.phone}`.trim() : '',
    });
    if (!result.success) {
      const next: Partial<Record<GuestField, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key === 'name' || key === 'email' || key === 'phone') next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onNext();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <h1 className="font-display text-3xl md:text-4xl">Contact Info</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First Name" htmlFor="contact-firstName">
          <Input
            id="contact-firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="Jordan"
            aria-invalid={Boolean(errors.name)}
            required
          />
        </Field>
        <Field label="Last Name" htmlFor="contact-lastName">
          <Input
            id="contact-lastName"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
            placeholder="Smith"
            aria-invalid={Boolean(errors.name)}
            required
          />
        </Field>
      </div>
      {errors.name ? <FieldError>{errors.name}</FieldError> : <Hint>As shown on your ID or passport</Hint>}

      <Field label="Email Address" htmlFor="contact-email">
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="your@email.com"
          aria-invalid={Boolean(errors.email)}
          required
        />
        {errors.email ? (
          <FieldError>{errors.email}</FieldError>
        ) : (
          <Hint>Your confirmation and check-in details arrive here.</Hint>
        )}
      </Field>

      <Field label="Phone number" htmlFor="contact-phone">
        <div className="flex gap-2">
          <Input
            id="contact-prefix"
            autoComplete="tel-country-code"
            aria-label="Country calling code"
            value={form.prefix}
            onChange={set('prefix')}
            className="w-20"
          />
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel-national"
            value={form.phone}
            onChange={set('phone')}
            placeholder="712 345 678"
            className="flex-1"
            aria-invalid={Boolean(errors.phone)}
            required
          />
        </div>
        {errors.phone ? <FieldError>{errors.phone}</FieldError> : <Hint>For check-in day only.</Hint>}
      </Field>

      <p className="text-xs text-ink-60">
        <span className="block">
          Expect emails and mobile updates from AVEXA to keep you informed about your bookings and our services.
        </span>
        <span className="block">
          By clicking &quot;Next&quot;, you agree that your information will be handled per our{' '}
          <Link className="underline hover:text-gold-dark" href="/terms">terms and conditions</Link> and{' '}
          <Link className="underline hover:text-gold-dark" href="/privacy">Privacy Policy</Link>.
        </span>
      </p>

      <button
        type="submit"
        className="w-full rounded-full bg-ink py-3 text-center font-semibold text-cream transition hover:bg-gold hover:text-ink"
      >
        Next
      </button>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-xs text-red-600">
      {children}
    </p>
  );
}
