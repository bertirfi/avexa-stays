'use client';

import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/cn';

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  prefix: string;
  phone: string;
  street: string;
  city: string;
  country: string;
  accountType: 'individual' | 'business';
  bookFor: 'self' | 'other';
  companyName: string;
  vatNumber: string;
  regNumber: string;
  companyStreet: string;
  companyCity: string;
  companyCountry: string;
}

interface Props {
  form: ContactForm;
  setForm: React.Dispatch<React.SetStateAction<ContactForm>>;
  onNext: () => void;
}

export function ContactInfoStep({ form, setForm, onNext }: Props) {
  const isBiz = form.accountType === 'business';
  const set =
    <K extends keyof ContactForm>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as ContactForm[K] }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="space-y-6"
    >
      <h1 className="font-display text-3xl md:text-4xl">Contact Info</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First Name" htmlFor="contact-firstName">
          <Input
            id="contact-firstName"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="Jordan"
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
            required
          />
        </Field>
      </div>
      <Hint>As shown on your ID or passport</Hint>

      <Field label="Email Address" htmlFor="contact-email">
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="your@email.com"
          required
        />
        <Hint>We&apos;ll send your booking confirmation here.</Hint>
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
            required
          />
        </div>
      </Field>

      <Field label="Street Address" htmlFor="contact-street">
        <Input
          id="contact-street"
          autoComplete="street-address"
          value={form.street}
          onChange={set('street')}
          placeholder="Street name and number"
          required
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="City" htmlFor="contact-city">
          <Input
            id="contact-city"
            autoComplete="address-level2"
            value={form.city}
            onChange={set('city')}
            placeholder="Bucharest"
            required
          />
        </Field>
        <Field label="Country" htmlFor="contact-country">
          <Input
            id="contact-country"
            autoComplete="country-name"
            value={form.country}
            onChange={set('country')}
            placeholder="Romania"
            required
          />
        </Field>
      </div>

      <div className="border-t border-gray-line pt-6">
        <Field label="Booking type" htmlFor="contact-accountType">
          <select
            id="contact-accountType"
            value={form.accountType}
            onChange={set('accountType')}
            className="block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition focus:border-ink focus:outline-none"
          >
            <option value="individual">Individual — personal stay</option>
            <option value="business">Business — invoice to a company</option>
          </select>
          <Hint>Choose &quot;Business&quot; to receive a company invoice for this booking.</Hint>
        </Field>
      </div>

      {isBiz && (
        <fieldset className="space-y-4 rounded-card border border-gold/30 bg-gold-pale/40 p-5">
          <legend className="px-2 font-mono-label text-gold-dark">Business invoice details</legend>
          <Field label="Company Name" htmlFor="contact-companyName">
            <Input
              id="contact-companyName"
              autoComplete="organization"
              value={form.companyName}
              onChange={set('companyName')}
              placeholder="Company SRL"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="VAT Number (CUI / CIF)" htmlFor="contact-vatNumber">
              <Input
                id="contact-vatNumber"
                autoComplete="off"
                value={form.vatNumber}
                onChange={set('vatNumber')}
                placeholder="RO12345678"
              />
            </Field>
            <Field label="Trade Register No. (J)" htmlFor="contact-regNumber">
              <Input
                id="contact-regNumber"
                autoComplete="off"
                value={form.regNumber}
                onChange={set('regNumber')}
                placeholder="J40/1234/2020"
              />
            </Field>
          </div>
          <Field label="Registered Address" htmlFor="contact-companyStreet">
            <Input
              id="contact-companyStreet"
              autoComplete="street-address"
              value={form.companyStreet}
              onChange={set('companyStreet')}
              placeholder="Street name and number"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="City" htmlFor="contact-companyCity">
              <Input
                id="contact-companyCity"
                autoComplete="address-level2"
                value={form.companyCity}
                onChange={set('companyCity')}
                placeholder="Bucharest"
              />
            </Field>
            <Field label="Country" htmlFor="contact-companyCountry">
              <Input
                id="contact-companyCountry"
                autoComplete="country-name"
                value={form.companyCountry}
                onChange={set('companyCountry')}
                placeholder="Romania"
              />
            </Field>
          </div>
        </fieldset>
      )}

      {/* Book for whom */}
      <div className="border-t border-gray-line pt-6">
        <p className="mb-3 text-sm font-semibold">Who are you booking for?</p>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            active={form.bookFor === 'self'}
            label="For Myself"
            onClick={() => setForm((f) => ({ ...f, bookFor: 'self' }))}
          />
          <RadioCard
            active={form.bookFor === 'other'}
            label="For Someone Else"
            onClick={() => setForm((f) => ({ ...f, bookFor: 'other' }))}
          />
        </div>
      </div>

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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  /** id of the control this label names — explicit for a11y + autofill. */
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cn(
        'block w-full rounded-2xl border border-gray-line bg-white px-4 py-3 text-sm transition placeholder:text-ink-60/60 focus:border-ink focus:outline-none',
        className,
      )}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-60">
      <Icon name="info" size={12} />
      {children}
    </p>
  );
}

function RadioCard({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
        active
          ? 'border-ink bg-cream font-semibold'
          : 'border-gray-line hover:border-ink',
      )}
    >
      <span
        className={cn(
          'grid size-5 place-items-center rounded-full border-2',
          active ? 'border-ink' : 'border-gray-line',
        )}
      >
        {active && <span className="size-2.5 rounded-full bg-ink" />}
      </span>
      {label}
    </button>
  );
}
