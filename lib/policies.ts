/** Single source of truth for the cancellation policy copy — used by
 * /cancellation, the FAQ, and the checkout notice so the text can't drift. */
export const CANCELLATION_POLICY = {
  nonMember: 'Non-member bookings are non-refundable from the moment of booking.',
  memberTiers: [
    '100% refund when cancelling 72+ hours before check-in',
    '50% refund between 72 and 24 hours before check-in',
    'No refund under 24 hours before check-in or no-show',
  ],
  cityTax: 'City tax is always refunded in full on any cancellation.',
  summary:
    'Members: 100% refund 72+ hours before check-in, 50% between 72 and 24 hours, no refund under 24 hours or no-show. Non-member bookings are non-refundable. City tax is always refunded in full.',
} as const;
