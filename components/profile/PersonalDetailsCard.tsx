'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Returns an { error } to surface inline and keep the form open, or nothing on success. */
  onSave: (next: { first: string; last: string; phone: string }) => Promise<{ error?: string } | void>;
}

export function PersonalDetailsCard({ firstName, lastName, email, phone, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [phoneInput, setPhoneInput] = useState(phone);

  function startEdit() {
    setFirst(firstName);
    setLast(lastName);
    setPhoneInput(phone);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setError(null);
    setEditing(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await onSave({ first: first.trim(), last: last.trim(), phone: phoneInput.trim() });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-4 rounded-2xl border border-gray-line bg-white px-5 py-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-mono-label text-ink-60">Personal details</h2>
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="ease-[var(--ease-snap)] rounded-lg border border-gray-line px-3.5 py-1.5 text-[13px] font-semibold text-gold-dark transition-colors hover:border-ink hover:text-ink"
          >
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
          <Field label="First name">
            <Value>{firstName || '—'}</Value>
          </Field>
          <Field label="Last name">
            <Value>{lastName || '—'}</Value>
          </Field>
          <Field label="Email">
            <Value>{email || '—'}</Value>
          </Field>
          <Field label="Phone">
            {phone ? (
              <Value>{phone}</Value>
            ) : (
              <span className="text-[15px] font-normal italic text-ink-60">Not provided</span>
            )}
          </Field>
        </div>
      ) : (
        <form onSubmit={submit} className="-mt-2">
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
            <InputField
              id="profile-first"
              label="First name"
              value={first}
              onChange={setFirst}
              placeholder="First name"
            />
            <InputField
              id="profile-last"
              label="Last name"
              value={last}
              onChange={setLast}
              placeholder="Last name"
            />
            <InputField
              id="profile-email"
              label="Email"
              type="email"
              value={email}
              onChange={() => {}}
              placeholder="Email"
              disabled
            />
            <InputField
              id="profile-phone"
              label="Phone"
              type="tel"
              value={phoneInput}
              onChange={setPhoneInput}
              placeholder="+40 7XX XXX XXX"
            />
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-[#FF4136]/10 px-3.5 py-2.5 text-[13px] font-medium text-[#c0281f]">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="ease-[var(--ease-snap)] w-full rounded-[10px] border-[1.5px] border-gray-line bg-white px-[22px] py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ease-[var(--ease-snap)] w-full rounded-[10px] border-[1.5px] border-ink bg-ink px-[22px] py-3 text-center text-sm font-semibold text-white transition-colors hover:border-gold-dark hover:bg-gold-dark disabled:opacity-60 sm:w-auto"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono-label text-ink-60">{label}</span>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-[15px] font-medium text-ink">{children}</span>;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

function InputField({ id, label, value, onChange, placeholder, type = 'text', disabled }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono-label text-ink-60">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-[10px] border-[1.5px] border-gray-line bg-cream px-3.5 py-3 text-sm font-medium text-ink outline-none transition-colors',
          'placeholder:font-normal placeholder:text-ink-60 focus:border-gold-dark',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      />
    </div>
  );
}
