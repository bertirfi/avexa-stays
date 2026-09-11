import { getReservation } from './client';
import { escapeHtml, sendEmail } from '@/lib/email/brevo';

/**
 * Check-in message for direct website reservations: the ChargeAutomation
 * check-in template with the reservation's unique CA link. Client rule 04.09:
 * it goes out from office@avexastays.com via Brevo — NOT through the Hostaway
 * conversation any more (that path produced a second, identical email next to
 * ChargeAutomation's own). If the CA link never appears we send NOTHING and
 * log an error for the team instead — never a message without the link.
 *
 * Best-effort end to end — a failure here must never affect the confirmed
 * booking. Runs post-response inside after().
 */

const CA_LINK_RE =
  /https:\/\/app\.chargeautomation\.com\/securelink\/[A-Za-z0-9_-]+(?:\?[\w=&%.-]*)?/;

// Overall budget for the whole confirmation attempt. Vercel's function window
// is 300s and is shared with the synchronous webhook work; 230s leaves margin.
const DEADLINE_MS = 230_000;

/**
 * ChargeAutomation writes CA_PRE_ARRIVAL_LINK into the reservation notes
 * with variable latency — observed live between ~9s and ~60s after creation.
 * Poll generously (~3.5 min, still inside Vercel's function window): without
 * the link there is nothing to send.
 */
async function findCheckinLink(
  reservationId: number,
  deadline: number,
  tries = 25,
  delayMs = 8_000,
): Promise<string | null> {
  for (let i = 0; i < tries; i += 1) {
    if (Date.now() >= deadline) return null; // out of budget — caller logs
    try {
      const reservation = await getReservation(reservationId);
      const notes = `${reservation.guestNote ?? ''}\n${reservation.hostNote ?? ''}`;
      const match = notes.match(CA_LINK_RE);
      if (match) return match[0];
      // The link is present but the regex missed it — surface loudly so we can
      // fix the pattern instead of silently sending nothing to the guest.
      const idx = notes.toLowerCase().indexOf('chargeautomation.com');
      if (idx !== -1) {
        const from = Math.max(0, idx - 20);
        console.error(
          `[hostaway] CA link present but unmatched for reservation ${reservationId} — regex needs updating. Around: ${notes.slice(from, from + 120)}`,
        );
      }
    } catch {
      // transient read failure — keep polling
    }
    if (i < tries - 1 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

export interface BookingConfirmationInput {
  reservationId: number;
  guestFirstName: string;
  guestEmail: string;
}

/**
 * Mirrors the ChargeAutomation template the client uses for OTA reservations
 * (same wording on every channel; "Powered by ChargeAutomation" footer
 * dropped), rendered as simple email HTML.
 */
function confirmationHtml(guestFirstName: string, checkinLink: string): string {
  const name = escapeHtml(guestFirstName);
  const link = escapeHtml(checkinLink);
  const p = (s: string) => `<p style="margin:0 0 14px">${s}</p>`;
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6;max-width:560px">
      ${p(`Hi ${name}!`)}
      ${p('Thank you for choosing Avexa Stays! We are thrilled to host you! ✨')}
      ${p('To activate your digital access, please complete your quick 2-minute online check-in below this message.<br>👇👇👇')}
      ${p('📌 IMPORTANT: Your self-check-in instructions will be found on this exact check-in link on your arrival day at 12:00 PM, BUT ONLY AFTER the online form is 100% completed.')}
      ${p('If you need anything, we are always here to help you! ☀️')}
      ${p('Avexa Stays | Anca &amp; Vlad ❤️')}
      ${p(`<a href="${link}" style="display:inline-block;background:#191919;color:#F7EDDB;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Complete Your Online Check-In</a>`)}
      <p style="margin:0;font-size:12px;color:#666">If the button does not open, copy this link: ${link}</p>
      <p style="margin:18px 0 0;font-size:12px;color:#666">© ${new Date().getFullYear()} — Prime Gold Living SRL</p>
    </div>`;
}

export async function sendBookingConfirmation(input: BookingConfirmationInput): Promise<void> {
  // Mock reservations (HOSTAWAY_MOCK_RESERVATIONS) carry a negative id — the
  // real PMS must never be polled for them.
  if (input.reservationId <= 0) return;

  // Overall budget for polling + send, so we never overrun Vercel's function
  // window and get killed mid-send.
  const deadline = Date.now() + DEADLINE_MS;
  try {
    const checkinLink = await findCheckinLink(input.reservationId, deadline);
    if (!checkinLink) {
      if (Date.now() >= deadline) {
        console.error(
          `[hostaway] confirmation deadline exceeded for reservation ${input.reservationId} — nothing sent`,
        );
        return;
      }
      console.error(
        `[hostaway] CA check-in link never appeared for reservation ${input.reservationId} — nothing sent (client rule: the CA-link message is the only guest email)`,
      );
      return;
    }

    const sent = await sendEmail({
      to: input.guestEmail,
      subject: 'Your online check-in — Avexa Stays',
      html: confirmationHtml(input.guestFirstName, checkinLink),
    });
    if (!sent) {
      console.error(
        `[hostaway] check-in email not sent for reservation ${input.reservationId} (Brevo returned false)`,
      );
    }
  } catch (err) {
    console.error(
      `[hostaway] check-in message failed for reservation ${input.reservationId}:`,
      err,
    );
  }
}
