/**
 * Minimal transactional email via Resend HTTP API — server-only.
 *
 * Scope (deliberate): auth emails go through Supabase SMTP and the booking
 * confirmation comes from Hostaway's own automation. The app itself sends ONE
 * email — the refund notice when payment succeeded but the dates were taken
 * (see the Stripe webhook). Best-effort: a missing key or API failure must
 * never break the money flow, only log.
 */
const FROM = 'AVEXA Stays <office@avexastays.com>';

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping:', input.subject);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, ...input }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[email] Resend failed:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Resend error:', err instanceof Error ? err.message : err);
    return false;
  }
}

/** The one app-sent email: payment refunded because the dates were just taken. */
export function refundNoticeEmail(booking: {
  guest_name: string;
  check_in: string;
  check_out: string;
  total_ron: number;
}): { subject: string; html: string } {
  const first = booking.guest_name.split(' ')[0] || 'there';
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
