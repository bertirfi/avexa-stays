'use client';

import { useState, useTransition } from 'react';
import { cancelBooking } from '@/app/(member)/my-trips/actions';

const ERROR_COPY: Record<string, string> = {
  not_cancellable:
    'This booking is no longer inside the free-cancellation window. Contact us below and we\'ll help.',
  refund_failed:
    'The refund could not be processed right now. Please try again in a minute, or contact us below.',
  not_found: 'We could not find this booking. Refresh the page and try again.',
};

/**
 * Two-step cancel (arm → confirm) so a stray tap never cancels a stay.
 * The server action re-checks the policy — this button is convenience only.
 */
export function CancelTripButton({ bookingId }: { bookingId: string }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-sm font-semibold text-[#2E7D32]">
        Cancelled — your full refund is on the way (5–10 business days).
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
        Cancel booking
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
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
        {pending ? 'Cancelling…' : 'Yes, cancel & refund'}
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
