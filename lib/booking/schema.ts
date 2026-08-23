import { z } from 'zod';

/**
 * Shared checkout/quote input contract.
 *
 * The SAME schema validates BOTH /api/checkout (creates the pending booking +
 * Stripe session) and /api/quote (read-only price preview). Keeping it in one
 * place means the two routes can never drift — the money the guest previews is
 * derived from exactly the same validated input the charge is derived from.
 *
 * Trust boundary (api-validation rule): the client sends ONLY ids/dates/guests/
 * rate/breakfast. Never money, never identity — the price is re-derived
 * server-side (lib/booking/quote) and the user comes from the Supabase session.
 */

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

/** Fields both routes need to produce a quote (no contact — checkout adds that). */
export const QuoteInputSchema = z.object({
  propertyId: z.string().trim().min(1).max(40),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(10),
  children: z.number().int().min(0).max(10),
  infants: z.number().int().min(0).max(10),
  // Single flat rate since M1.1 — a legacy `rateId` from an open old tab is an
  // unknown key, which z.object() strips: accepted and ignored by design.
  breakfast: z.boolean().default(false),
  displayCurrency: z.enum(['EUR', 'RON', 'USD']).default('EUR'),
});

export type QuoteInputBody = z.infer<typeof QuoteInputSchema>;

/** Checkout extends the quote input with the guest contact block. */
export const CheckoutBodySchema = QuoteInputSchema.extend({
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: optionalTrimmed(40),
    invoiceCompany: optionalTrimmed(200),
    invoiceVat: optionalTrimmed(40),
    invoiceRegCom: optionalTrimmed(60),
    invoiceAddress: optionalTrimmed(400),
  }),
});

export type CheckoutBody = z.infer<typeof CheckoutBodySchema>;

/**
 * /api/quote success response — the authoritative money the checkout UI renders.
 * All values are RON integers (money of record; display conversion happens
 * client-side via the currency context).
 */
export interface QuoteBreakdown {
  accommodationRon: number;
  /** Per-night charged prices (RON) — the expandable accommodation breakdown. */
  nightly: Array<{ date: string; ron: number }>;
  extrasRon: number;
  cleaningRon: number;
  cityTaxRon: number;
  totalRon: number;
  nights: number;
  perNightRon: number;
}
