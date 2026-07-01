---
paths:
  - "lib/pricing.ts"
  - "lib/fx.ts"
  - "lib/data/properties.ts"
  - "lib/booking.ts"
  - "app/book/**"
  - "app/api/checkout/**"
  - "app/api/webhooks/stripe/**"
---
# Pricing pipeline — single source of truth

The guest-facing price is derived, never invented. Do not hardcode nightly prices anywhere.

Formula (see `lib/pricing.ts`, spec §3.1):

```
effective_RON = base_RON × (1 + markup)                      // markup default 18%
effective_EUR = ceil( effective_RON ÷ fxRate × (1 + fxMargin) )  // fxRate 5.2, fxMargin 3%
```

- `effective_EUR` IS both the charged amount and the displayed "member rate".
- The **15% member discount is presentation-only**: the struck-through "rack" rate is `effective ÷ (1 − 0.15)`. Never actually subtract 15% from the charge.
- All three knobs live in **server-only env** (`AVEXA_MARKUP_PERCENT`, `AVEXA_FX_RATE`, `AVEXA_FX_MARGIN_PERCENT`), configured in ONE place, never per-listing. Never expose them to the client; compute prices server-side.
- FX rate is **fixed** (deterministic prices), not live. `/api/cron/fx` records the real BNR rate in Supabase only to monitor drift.
- Base price + availability come from **Hostaway** (source of truth, cached in Supabase). See the Hostaway rule.
- Before creating a Stripe Checkout session, **re-verify the price server-side against live Hostaway pricing**. Never trust a price sent from the client.
- Keep `lib/pricing.ts` as the single entry point for the formula. Do not duplicate it in components or route handlers — import `effectiveEurPerNight` / `rackEurPerNight`.
