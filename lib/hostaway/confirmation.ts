import {
  getReservation,
  getReservationConversations,
  sendConversationMessage,
} from './client';

/**
 * Check-in message for direct website reservations (client rule, final,
 * 2026-07-02): the guest receives exactly ONE email — the ChargeAutomation
 * check-in template with the reservation's unique CA link, sent through the
 * reservation's Hostaway conversation (communicationType "email"), the same
 * pipeline ChargeAutomation itself uses for OTA reservations. No other email,
 * no fallback sender, no separate confirmation: if the CA link never appears
 * we send NOTHING and log an error for the team instead.
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
}

/**
 * Mirrors the ChargeAutomation template the client uses for OTA reservations
 * (same wording on every channel; "Powered by ChargeAutomation" footer
 * dropped). CA posts this message itself for OTA bookings; we post it for
 * website bookings through the same Hostaway conversation, so the sender
 * ("Avexa Stays") and formatting match.
 */
function confirmationBody(guestFirstName: string, checkinLink: string): string {
  return [
    `Hi ${guestFirstName}!`,
    '',
    'Thank you for choosing Avexa Stays! We are thrilled to host you! ✨',
    '',
    'To activate your digital access, please complete your quick 2-minute online check-in below this message.',
    '👇👇👇',
    '',
    '📌 IMPORTANT: Your self-check-in instructions will be found on this exact check-in link on your arrival day at 12:00 PM, BUT ONLY AFTER the online form is 100% completed.',
    '',
    'If you need anything, we are always here to help you! ☀️',
    '',
    'Avexa Stays | Anca & Vlad ❤️',
    '',
    `Complete Your Online Check-In: ${checkinLink}`,
    '',
    `© ${new Date().getFullYear()} — Prime Gold Living SRL`,
  ].join('\n');
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

    const body = confirmationBody(input.guestFirstName, checkinLink);

    // The conversation is created by Hostaway moments after the reservation;
    // retry a few times, then give up loudly — never through another sender.
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const conversations = await getReservationConversations(input.reservationId);
        const conversation =
          conversations.find((c) => c.type === 'host-guest-email') ?? conversations[0];
        if (!conversation) throw new Error('no conversation attached to reservation');
        await sendConversationMessage(conversation.id, body);
        return;
      } catch (err) {
        if (attempt === 3) throw err;
        if (Date.now() >= deadline) {
          console.error(
            `[hostaway] confirmation deadline exceeded for reservation ${input.reservationId} — nothing sent`,
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 5_000));
      }
    }
  } catch (err) {
    console.error(
      `[hostaway] check-in message failed for reservation ${input.reservationId}:`,
      err,
    );
  }
}
