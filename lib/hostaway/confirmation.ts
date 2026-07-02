import {
  getReservation,
  getReservationConversations,
  sendConversationMessage,
} from './client';
import { sendEmail } from '@/lib/email/resend';

/**
 * Booking-confirmation message for direct website reservations (client
 * decision 2026-07-02, revising decision 13: ChargeAutomation generates the
 * pre-arrival check-in link for our reservations but never emails direct/API
 * guests, so WE deliver it).
 *
 * Primary channel: the reservation's Hostaway conversation with
 * communicationType "email" — the guest gets the email and the message (plus
 * any replies) stays visible in the Hostaway inbox for the client's team.
 * Fallback: Resend. Everything is best-effort — a failure here must never
 * affect the already-confirmed booking.
 */

const CA_LINK_RE = /https:\/\/app\.chargeautomation\.com\/securelink\/[A-Za-z0-9]+/;

/**
 * ChargeAutomation writes CA_PRE_ARRIVAL_LINK into the reservation notes
 * with variable latency — observed live between ~9s and ~60s after creation.
 * Poll up to ~95s (we run inside after(), the response is long gone); the
 * confirmation is still worth sending without the link if CA is slower.
 */
async function findCheckinLink(
  reservationId: number,
  tries = 15,
  delayMs = 6_000,
): Promise<string | null> {
  for (let i = 0; i < tries; i += 1) {
    try {
      const reservation = await getReservation(reservationId);
      const notes = `${reservation.guestNote ?? ''}\n${reservation.hostNote ?? ''}`;
      const match = notes.match(CA_LINK_RE);
      if (match) return match[0];
    } catch {
      // transient read failure — keep polling
    }
    if (i < tries - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

export interface BookingConfirmationInput {
  reservationId: number;
  guestEmail: string;
  guestFirstName: string;
  propertyName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  totalRon: number;
}

/**
 * Mirrors the ChargeAutomation template the client uses for OTA reservations
 * (client request 2026-07-02: the guest gets ONE email, same wording on every
 * channel). CA posts this message itself for OTA bookings; we post it for
 * website bookings, through the same Hostaway conversation, so the sender
 * ("Avexa Stays") and formatting match.
 */
function confirmationBody(input: BookingConfirmationInput, checkinLink: string | null): string {
  if (!checkinLink) {
    // CA link never appeared — send a plain confirmation instead of a
    // check-in invitation that would have nothing to link to.
    return [
      `Hi ${input.guestFirstName}!`,
      '',
      'Thank you for choosing Avexa Stays! We are thrilled to host you! ✨',
      '',
      `Check-in: ${input.checkIn} (from 3:00 PM)`,
      `Check-out: ${input.checkOut} (until 11:00 AM)`,
      `Guests: ${input.guests}`,
      `Total paid: ${input.totalRon.toFixed(0)} RON (VAT included) — nothing left to pay on arrival.`,
      '',
      'Your online check-in link follows in a separate message.',
      '',
      'If you need anything, we are always here to help you! ☀️',
      '',
      'Avexa Stays | Anca & Vlad ❤️',
      '',
      `© ${new Date().getFullYear()} — Prime Gold Living SRL`,
    ].join('\n');
  }

  return [
    `Hi ${input.guestFirstName}!`,
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendBookingConfirmation(input: BookingConfirmationInput): Promise<void> {
  try {
    const checkinLink = await findCheckinLink(input.reservationId);
    const body = confirmationBody(input, checkinLink);

    try {
      const conversations = await getReservationConversations(input.reservationId);
      const conversation =
        conversations.find((c) => c.type === 'host-guest-email') ?? conversations[0];
      if (!conversation) throw new Error('no conversation attached to reservation');
      await sendConversationMessage(conversation.id, body);
      return;
    } catch (err) {
      console.warn(
        `[hostaway] conversation send failed for reservation ${input.reservationId} — falling back to Resend`,
        err,
      );
    }

    await sendEmail({
      to: input.guestEmail,
      subject: `Booking confirmed — ${input.propertyName}, ${input.checkIn} → ${input.checkOut}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#191919;line-height:1.6;max-width:520px;white-space:pre-line">${escapeHtml(body)}</div>`,
    });
  } catch (err) {
    console.error(
      `[hostaway] booking confirmation failed for reservation ${input.reservationId}:`,
      err,
    );
  }
}
