import { Sentences } from '@/components/shared/Sentences';

/**
 * "Check-in & access" view model — built server-side in my-trips/page.tsx from
 * the CRM answer (lib/crm/trip.ts). The site shows exactly what the CRM sends;
 * it never derives availability itself.
 */
export type TripCheckin =
  /** Reservation not in the CRM yet (webhook lag) or link not generated yet. */
  | { state: 'pending' }
  | { state: 'link'; url: string }
  | { state: 'completed'; availableFromLabel: string | null }
  | { state: 'code'; code: string; address: string | null; validityLabel: string | null };

/** Presentational, server-compatible. Rendered inside the ph-mask'd trips list. */
export function TripCheckinCard({ checkin }: { checkin: TripCheckin }) {
  return (
    <div className="mt-5 rounded-card border border-gold/30 bg-gold-pale/40 p-4">
      <p className="font-mono-label text-gold-dark">— Check-in &amp; access</p>

      {checkin.state === 'pending' && (
        <p className="mt-2 text-sm text-ink-80">Your check-in details will appear here shortly.</p>
      )}

      {checkin.state === 'link' && (
        <>
          <p className="mt-2 text-sm text-ink-80">
            <Sentences text="Takes 2 minutes. Your access code appears here once it is done, on the day you arrive." />
          </p>
          <a
            href={checkin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-ink/85"
          >
            Complete your online check-in
          </a>
        </>
      )}

      {checkin.state === 'completed' && (
        <>
          <p className="mt-2 text-sm font-semibold text-[#2E7D32]">✓ Check-in completed</p>
          <p className="mt-1 text-sm text-ink-80">
            {checkin.availableFromLabel
              ? `Your access code appears here from ${checkin.availableFromLabel}, Bucharest time.`
              : 'Your access code appears here on the day you arrive.'}
          </p>
        </>
      )}

      {checkin.state === 'code' && (
        <>
          <p className="mt-2 text-sm text-ink-80">Your access code</p>
          <p className="font-display mt-1 text-4xl tracking-[0.12em] text-ink">{checkin.code}</p>
          {checkin.address && <p className="mt-3 text-sm text-ink">{checkin.address}</p>}
          {checkin.validityLabel && (
            <p className="mt-1 text-xs text-ink-60">Valid {checkin.validityLabel}, Bucharest time.</p>
          )}
        </>
      )}
    </div>
  );
}
