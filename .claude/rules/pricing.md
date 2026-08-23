---
paths:
  - "lib/pricing.ts"
  - "lib/currency.ts"
  - "lib/fx.ts"
  - "lib/data/properties.ts"
  - "lib/data/availability.ts"
  - "lib/booking.ts"
  - "components/currency/**"
  - "app/book/**"
  - "app/api/checkout/**"
  - "app/api/webhooks/stripe/**"
---
# Pricing — RON is the money of record

Every stored, computed, and charged amount is **RON**. EUR/USD are display-only. Do not hardcode nightly prices anywhere.

Formula (single entry point: `lib/pricing.ts`):

```
accommodation_RON/night = ceil( base_RON × (1 + markup) × (1 + paymentFee) )   // flat 21% markup, 0% fee (Spec M1.1.1: Hostaway +21%, nothing else)
cleaning_RON            = per-property flat fee (125/150/180) — own line, "cleaning not included" in the nightly rate
city_tax_RON            = 10 × nights × persons                                 // pass-through: NO markup, NO fee
charged                 = accommodation + extras + cleaning + city tax  — ALWAYS RON (Stripe currency 'ron')
display                 = RON ÷ AVEXA_FX_RATE_EUR (5.25) | AVEXA_FX_RATE_USD (4.65)
```

- Guests see ONE "total price" line for accommodation — never break out the markup. Cleaning fee and city tax are their own lines (city tax: real RON + "≈ equivalent"). Extras are their own line. "11% VAT included" — VAT is in the price, never added on top. No percentage discounts anywhere; cancellation rights come from membership (DX7: member 100% ≥72h / 50% 72–24h / 0% <24h; city tax always refunded), single rate — no saver/flex split.
- Knobs are **server-only env** (`AVEXA_MARKUP_PERCENT`, `AVEXA_PAYMENT_FEE_PERCENT`, `AVEXA_FX_RATE_EUR`, `AVEXA_FX_RATE_USD`), configured in ONE place, never per-listing. Never import `lib/pricing` in a client component — display rates reach the client only via `<CurrencyProvider>` props; use `lib/currency` (client-safe) for formatting.
- Base price + availability come from **Hostaway** (source of truth, cached in Supabase). See the Hostaway rule.
- Before creating a Stripe Checkout Session, **re-derive the price server-side** (live Hostaway check + this formula). Never trust a price, total, or currency sent from the client — the client sends only ids/dates/guests.
- The Hostaway reservation records the SAME RON total the guest paid (`totalPrice`, currency RON, `isPaid=1`). Money flows only through our Stripe — never Hostaway's payment integration.
- Extras are priced from the DB (`services`/`booking_services`) and sent to Stripe as inline `price_data` line items — never as Stripe catalog products.
- `lib/fx.ts` is BNR drift monitoring only — never wire it into a price path.
