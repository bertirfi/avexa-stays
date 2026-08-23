/**
 * Minimal transactional email via the Brevo API — server-only.
 *
 * Scope (deliberate): auth emails go through Supabase SMTP (pointed at Brevo
 * SMTP in the Supabase dashboard); the guest check-in message goes EXCLUSIVELY
 * via the reservation's Hostaway conversation (lib/hostaway/confirmation.ts —
 * client rule: one email, no fallback sender). The app itself sends money
 * emails only — the refund notice when payment succeeded but the dates were
 * taken (Stripe webhook), the cancellation-confirmed notice (My Trips cancel)
 * — plus the internal ops alert.
 * Best-effort: a missing key or API failure must never break the money flow,
 * only log.
 */
const SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'AVEXA Stays',
  email: process.env.BREVO_SENDER_EMAIL || 'office@avexastays.com',
};

/** Escape guest-supplied text before interpolating into email HTML. */
function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn('[email] BREVO_API_KEY not set — skipping:', input.subject);
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[email] Brevo failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Brevo error:', err instanceof Error ? err.message : err);
    return false;
  }
}

/** Guest cancelled from My Trips (Flexible rate, inside the free window). */
export function cancellationConfirmedEmail(booking: {
  guest_name: string;
  check_in: string;
  check_out: string;
  total_ron: number;
  /** Actual refunded amount (city tax always in full + tiered remainder). */
  refund_ron: number;
  /** Tier applied to the non-city-tax portion: 100 or 50. */
  refund_percent: number;
}): { subject: string; html: string } {
  const first = escapeHtml(booking.guest_name.split(' ')[0] || 'there');
  const full = booking.refund_ron >= Number(booking.total_ron);
  return {
    subject: full
      ? 'Your AVEXA booking is cancelled — full refund on the way'
      : 'Your AVEXA booking is cancelled — refund on the way',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6;max-width:520px">
        <p>Hi ${first},</p>
        <p>Your stay <strong>${booking.check_in} → ${booking.check_out}</strong> has been
        cancelled, as requested.</p>
        <p><strong>A refund of ${Number(booking.refund_ron).toFixed(0)} RON${
          full
            ? ' (your full payment)'
            : ` (${booking.refund_percent}% of your stay under the member cancellation policy — city tax refunded in full)`
        } has been issued.</strong> Depending on your bank, the refund appears within 5–10 business days.</p>
        <p>Plans change — the city stays. Whenever you're ready, your suite is at
        <a href="https://avexastays.com" style="color:#B08840">avexastays.com</a>.</p>
        <p>— AVEXA Stays</p>
      </div>
    `,
  };
}

/** The one app-sent email: payment refunded because the dates were just taken. */
export function refundNoticeEmail(booking: {
  guest_name: string;
  check_in: string;
  check_out: string;
  total_ron: number;
}): { subject: string; html: string } {
  const first = escapeHtml(booking.guest_name.split(' ')[0] || 'there');
  return {
    subject: 'Your AVEXA booking could not be completed — full refund issued',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6;max-width:520px">
        <p>Hi ${first},</p>
        <p>We're sorry — the dates <strong>${booking.check_in} → ${booking.check_out}</strong>
        were booked by another guest moments before your payment completed, so we could not
        confirm your reservation.</p>
        <p><strong>Your payment of ${Number(booking.total_ron).toFixed(0)} RON has been refunded in full.</strong>
        Depending on your bank, the refund appears within 5–10 business days.</p>
        <p>The city is still yours — other dates and suites are open at
        <a href="https://avexastays.com" style="color:#B08840">avexastays.com</a>.</p>
        <p>— AVEXA Stays</p>
      </div>
    `,
  };
}
