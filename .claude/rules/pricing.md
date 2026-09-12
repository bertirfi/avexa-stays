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
cleaning_RON            = per-property flat fee (120/150/180, client decision 24.08) — charged + stored separately; DISPLAYED as its own "Cleaning fee" line in every price breakdown (client 12.09), included in the total
city_tax_RON            = 10 × nights × persons                                 // pass-through: NO markup, NO fee
charged                 = accommodation + extras + cleaning + city tax  — ALWAYS RON (Stripe currency 'ron')
display                 = RON ÷ (BNR previous-day rate ÷ 1.01)  — lib/fx-rates.ts (D11); AVEXA_FX_RATE_* only as fallback
```

- Guests see ONE "total price" line for accommodation (accommodation only) — never break out the markup, no "cleaning not included" wording; "Cleaning fee" is its own visible line right under it in Price details / checkout (client 12.09, supersedes the 04.09 "fold it" and 11.09 "inside the breakdown only" rules); card prices ("from €X", dated totals) still include cleaning. City tax is its own line: real RON + "≈ equivalent" (never a rounded foreign amount). Extras are their own line. Cleaning stays its own line ONLY on ops surfaces (Hostaway finance lines, DB `extras`). "11% VAT included" — VAT is in the price, never added on top. No percentage discounts anywhere; cancellation rights come from membership (DX7: member 100% ≥72h / 50% 72–24h / 0% <24h; city tax always refunded), single rate — no saver/flex split.
- Knobs are **server-only env** (`AVEXA_MARKUP_PERCENT`, `AVEXA_PAYMENT_FEE_PERCENT`, `AVEXA_FX_RATE_EUR`, `AVEXA_FX_RATE_USD`), configured in ONE place, never per-listing. Never import `lib/pricing` in a client component — display rates reach the client only via `<CurrencyProvider>` props; use `lib/currency` (client-safe) for formatting.
- Base price + availability come from **Hostaway** (source of truth, cached in Supabase). See the Hostaway rule.
- Before creating a Stripe Checkout Session, **re-derive the price server-side** (live Hostaway check + this formula). Never trust a price, total, or currency sent from the client — the client sends only ids/dates/guests.
- The Hostaway reservation records the SAME RON total the guest paid (`totalPrice`, currency RON, `isPaid=1`). Money flows only through our Stripe — never Hostaway's payment integration.
- Extras are priced from the DB (`services`/`booking_services`) and sent to Stripe as inline `price_data` line items — never as Stripe catalog products.
- `lib/fx.ts` + `lib/fx-rates.ts` feed the DISPLAY rate only (BNR previous day +1%, frozen per booking in `display_fx_rate`); never a charge path — Stripe/Hostaway stay in RON.
