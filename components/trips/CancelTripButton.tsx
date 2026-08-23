'use client';

import { useState, useTransition } from 'react';
import { cancelBooking } from '@/app/(member)/my-trips/actions';
import { CANCELLATION_POLICY } from '@/lib/policies';

const ERROR_COPY: Record<string, string> = {
  not_cancellable:
    'This booking is no longer inside a refundable cancellation window. Contact us below and we\'ll help.',
  refund_failed:
    'The refund could not be processed right now. Please try again in a minute, or contact us below.',
  not_found: 'We could not find this booking. Refresh the page and try again.',
};

/**
 * Two-step cancel (arm → confirm) so a stray tap never cancels a stay.
 * The server action re-checks the tiered policy — this button is convenience
 * only, and its copy comes from lib/policies so it can't drift.
 */
export function CancelTripButton({
  bookingId,
  refundPercent,
  halfDeadlineLabel,
}: {
  bookingId: string;
  /** Tier applying right now: 100 or 50 (0 never renders this button). */
  refundPercent: 100 | 50 | 0;
  /** "Aug 17, 3:00 PM" — the 50%-tier deadline, for the 50% button label. */
  halfDeadlineLabel: string | null;
}) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-sm font-semibold text-[#2E7D32]">
        Cancelled — your refund is on the way (5–10 business days).
      </p>
    );
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="rounded-full border border-gray-line px-5 py-2 text-sm font-semibold text-ink-60 transition hover:border-[#B23A3A] hover:text-[#B23A3A]"
      >
        {refundPercent === 100
          ? 'Cancel now — 100% refund'
          : `Cancel now — 50% refund${halfDeadlineLabel ? ` (until ${halfDeadlineLabel})` : ''}`}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="w-full text-xs text-ink-60">
        {refundPercent === 100
          ? CANCELLATION_POLICY.memberTiers[0]
          : CANCELLATION_POLICY.memberTiers[1]}{' '}
        {CANCELLATION_POLICY.cityTax}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await cancelBooking(bookingId);
            if (result.ok) {
              setDone(true);
            } else {
              setError(ERROR_COPY[result.error ?? 'not_found']);
              setArmed(false);
            }
          });
        }}
        className="rounded-full bg-[#B23A3A] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#963030] disabled:opacity-60"
      >
        {pending
          ? 'Cancelling…'
          : `Yes, cancel — ${refundPercent}% refund`}
      </button>
      {!pending && (
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="text-sm font-semibold text-ink-60 transition hover:text-ink"
        >
          Keep booking
        </button>
      )}
      {error && <p className="w-full text-sm text-[#B23A3A]">{error}</p>}
    </div>
  );
}
