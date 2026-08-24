/**
 * Minimal transactional email via the Brevo API — server-only.
 *
 * Scope: ALL transactional mail goes through Brevo from office@avexastays.com
 * (client decision 24.08). Auth emails go through Supabase SMTP (pointed at
 * Brevo SMTP in the Supabase dashboard); the CA check-in link additionally
 * rides the reservation's Hostaway conversation (lib/hostaway/confirmation.ts).
 * The app sends: the booking confirmation (Stripe webhook), the refund notice
 * when payment succeeded but the dates were taken (Stripe webhook), the
 * cancellation-confirmed notice (My Trips cancel) — plus the internal ops alert.
 * Best-effort: a missing key or API failure must never break the money flow,
 * only log.
 */
import { CANCELLATION_POLICY } from '@/lib/policies';
import { CONTACT_EMAIL, PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/contact';

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

const GOLD = '#B08840';
const INK = '#191919';
const MUTED = '#6b6b6b';

/** "1.234 RON" — stored amounts only, never recomputed here. */
function formatRon(ron: number): string {
  return `${Math.round(Number(ron)).toLocaleString('en-US')} RON`;
}

/** " ≈ €235" when the booking stored a display currency + fx rate, else "". */
function formatApprox(ron: number, currency: string, fxRate: number | null): string {
  if (currency === 'RON' || !fxRate || fxRate <= 0) return '';
  const symbol = ({ EUR: '€', USD: '$' } as Record<string, string>)[currency] ?? currency;
  const amount = Math.round(Number(ron) / fxRate).toLocaleString('en-US');
  return ` <span style="color:${MUTED};font-size:13px">≈ ${symbol}${amount}</span>`;
}

/** "Fri, Aug 28, 2026" from a YYYY-MM-DD date string (calendar date, no TZ math). */
function formatStayDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Booking confirmed — the reservation-details email sent right after payment
 * (Stripe webhook; client decision 24.08: all transactional mail via Brevo).
 * Amounts are the STORED booking amounts — the exact checkout breakdown —
 * never recomputed. Policy lines mirror lib/policies.ts verbatim (Spec M1.3.1),
 * picked by the booking's rate plan (flexible = member cancellation rights).
 */
export function bookingConfirmationEmail(input: {
  booking: {
    order_id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    infants: number;
    rate_plan: 'non_refundable' | 'flexible';
    accommodation_ron: number;
    extras_ron: number;
    city_tax_ron: number;
    total_ron: number;
    extras: unknown;
    display_currency: string;
    display_fx_rate: number | null;
  };
  property: { name: string; address: string; checkin: string; checkout: string };
}): { subject: string; html: string } {
  const { booking, property } = input;
  const first = escapeHtml(booking.guest_name.split(' ')[0] || 'there');

  // Cleaning lives inside `extras` jsonb (id 'cleaning') — split it out as its
  // own line, exactly like checkout and the Hostaway finance lines do.
  const extrasArr = Array.isArray(booking.extras)
    ? (booking.extras as Array<{ id?: string; ron?: number }>)
    : [];
  const cleaningRon = Number(extrasArr.find((e) => e.id === 'cleaning')?.ron ?? 0);
  const otherExtrasRon = Number(booking.extras_ron) - cleaningRon;

  const guestParts = [
    `${booking.adults} ${booking.adults === 1 ? 'adult' : 'adults'}`,
    booking.children > 0
      ? `${booking.children} ${booking.children === 1 ? 'child' : 'children'}`
      : null,
    booking.infants > 0
      ? `${booking.infants} ${booking.infants === 1 ? 'infant' : 'infants'}`
      : null,
  ].filter(Boolean);

  const policyLines =
    booking.rate_plan === 'flexible'
      ? [...CANCELLATION_POLICY.memberTiers, CANCELLATION_POLICY.cityTax]
      : [CANCELLATION_POLICY.nonMember, CANCELLATION_POLICY.cityTax];

  const approx = (ron: number) =>
    formatApprox(ron, booking.display_currency, booking.display_fx_rate);
  const priceRow = (label: string, ron: number) => `
        <tr>
          <td style="padding:6px 0;color:${MUTED}">${label}</td>
          <td style="padding:6px 0;text-align:right;white-space:nowrap;color:${INK}">${formatRon(ron)}${approx(ron)}</td>
        </tr>`;

  const detailRow = (label: string, value: string) => `
        <tr>
          <td style="padding:4px 12px 4px 0;color:${MUTED};white-space:nowrap;vertical-align:top">${label}</td>
          <td style="padding:4px 0;color:${INK}">${value}</td>
        </tr>`;

  return {
    subject: `Your AVEXA Stays booking is confirmed — ${property.name}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:${INK};line-height:1.6;max-width:560px">
        <p style="margin:0 0 4px;letter-spacing:2px;font-size:12px;color:${GOLD};text-transform:uppercase">AVEXA Stays</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:bold">Your booking is confirmed</h1>
        <p>Hi ${first},</p>
        <p>Thank you — your stay is booked and paid. Here are your reservation details
        (order <strong>${escapeHtml(booking.order_id)}</strong>).</p>

        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-collapse:collapse;font-size:14px">
          ${detailRow('Suite', `<strong>${escapeHtml(property.name)}</strong><br>${escapeHtml(property.address)}`)}
          ${detailRow('Check-in', `${formatStayDate(booking.check_in)} · from ${escapeHtml(property.checkin)}`)}
          ${detailRow('Check-out', `${formatStayDate(booking.check_out)} · until ${escapeHtml(property.checkout)}`)}
          ${detailRow('Guests', guestParts.join(', '))}
        </table>

        <p style="margin:20px 0 6px;font-weight:bold;border-bottom:2px solid ${GOLD};padding-bottom:4px">Price breakdown</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
          ${priceRow('Accommodation', Number(booking.accommodation_ron))}
          ${otherExtrasRon > 0 ? priceRow('Extra services', otherExtrasRon) : ''}
          ${cleaningRon > 0 ? priceRow('Cleaning fee', cleaningRon) : ''}
          ${priceRow('City tax', Number(booking.city_tax_ron))}
          <tr>
            <td style="padding:10px 0 0;border-top:1px solid #ddd;font-weight:bold">Total paid</td>
            <td style="padding:10px 0 0;border-top:1px solid #ddd;text-align:right;white-space:nowrap;font-weight:bold">${formatRon(Number(booking.total_ron))}${approx(Number(booking.total_ron))}</td>
          </tr>
        </table>
        <p style="margin:6px 0 0;color:${MUTED};font-size:13px">11% VAT included.</p>

        <p style="margin:24px 0 6px;font-weight:bold;border-bottom:2px solid ${GOLD};padding-bottom:4px">Cancellation policy</p>
        <ul style="margin:8px 0;padding-left:18px;font-size:14px">
          ${policyLines.map((line) => `<li style="margin:4px 0">${line}</li>`).join('')}
        </ul>

        <p style="margin:24px 0 12px">You can view or manage this booking anytime at
        <a href="https://avexastays.com/my-trips" style="color:${GOLD}">avexastays.com/my-trips</a>.</p>
        <p style="color:${MUTED};font-size:14px">Questions? Write to
        <a href="mailto:${CONTACT_EMAIL}" style="color:${GOLD}">${CONTACT_EMAIL}</a> or message us on
        <a href="${WHATSAPP_URL}" style="color:${GOLD}">WhatsApp (${PHONE_DISPLAY})</a>.</p>
        <p>See you in Bucharest,<br>— AVEXA Stays</p>
      </div>
    `,
  };
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
