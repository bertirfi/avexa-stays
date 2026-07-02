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
 * ~10s after creation (observed live). Poll briefly; the confirmation is
 * still worth sending without the link if CA is slow.
 */
async function findCheckinLink(
  reservationId: number,
  tries = 6,
  delayMs = 4_000,
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

function confirmationBody(input: BookingConfirmationInput, checkinLink: string | null): string {
  const lines = [
    `Hi ${input.guestFirstName},`,
    '',
    `Your stay at ${input.propertyName} is confirmed — thank you for booking direct with AVEXA Stays.`,
    '',
    `Check-in: ${input.checkIn} (from 3:00 PM)`,
    `Check-out: ${input.checkOut} (until 11:00 AM)`,
    `Guests: ${input.guests}`,
    `Total paid: ${input.totalRon.toFixed(0)} RON (VAT included) — nothing left to pay on arrival.`,
  ];
  if (checkinLink) {
    lines.push(
      '',
      `Complete your online check-in here: ${checkinLink}`,
      'It takes two minutes and unlocks your arrival instructions.',
    );
  }
  lines.push(
    '',
    'No front desk. No friction. No compromise.',
    'AVEXA Stays · avexastays.com · office@avexastays.com',
  );
  return lines.join('\n');
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
