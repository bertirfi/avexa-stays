# Phase 5 — Production Booking Platform — Build Spec

> Status: **AWAITING ROBERT'S APPROVAL — no build work before sign-off**
> Date: 2026-06-12 · Author: Fable (interview with Robert same day)
> Branch: `feat/nextjs-platform` · `main`/coming-soon/vercel.json untouched until Wave 7

---

## 1. Goal

Turn the existing demo-mode UI (hardcoded data, localStorage auth, mocked payment)
into the production platform: Hostaway as source of truth, Supabase as cache/DB/auth,
Stripe payments (deferred — see §4), Airbnb-class UX/perf, SEO for
"Bucharest city center apartments". Serves all 4 core goals in CLAUDE.md.

## 2. Decisions locked in the 2026-06-12 interview

| # | Decision |
|---|----------|
| D1 | **Stripe deferred** — Robert has no Stripe access yet. Build everything else first; payment goes behind a `PaymentProvider` interface + stub. Stripe lands as its own wave when keys arrive. |
| D2 | **Pricing:** Hostaway returns RON. Site displays AND charges EUR: `EUR = (RON ÷ BNR daily rate) × 1.03`, rounded **up** to whole EUR per night. BNR rate cached daily (cron). |
| D3 | **Account required to book** (no guest checkout). Checkout keeps its auth gate. |
| D4 | **Member −15% vs OTA price** (variant 1) — PROVISIONAL, Robert wants to revisit. Implemented as a config value (`MEMBER_DISCOUNT_VS_OTA = 0.15`), display logic isolated so mechanics can change cheaply. |
| D5 | **Two rates:** non-refundable (cheaper) + free-cancellation until **5 days** before check-in (window configurable). **Rename required** — "Saver/Flex" is NUMA's naming. Shortlist in §10. |
| D6 | **Multi-room:** on a stay page, sibling suites from the same building/neighborhood appear as a section (with guest capacity); "Add another room" adds them to the same dates → one payment, N linked Hostaway reservations. |
| D7 | **Extra services** sold as separate Stripe Checkout line items (clean price breakdown + clean Stripe invoicing), data pushed back to the Hostaway reservation. Catalog lives in Supabase (admin-editable later). Exact service list/prices TBD by Robert (mockups today). |
| D8 | **URLs:** keep `/stays/[slug]` (slug-only canonical, 301 from numeric ids) + NEW `/locations/[slug]` neighborhood pages. Nothing is indexed yet, so this is free. |
| D9 | **Reviews:** sync from Hostaway (channel reviews) → Supabase → Review JSON-LD. Verify endpoint availability on Robert's plan at build; fallback = manual curated entries. |
| D10 | **Video hero:** build the slot video-ready (poster-first, zero LCP impact); launch with current gradient+photo; activate when Robert delivers the file. |
| D11 | **Auth at launch:** Supabase Auth with Google OAuth + email. Apple Sign-In later (no Apple Developer account yet) — button hidden until configured. |

## 3. Architecture (target)

```
Hostaway (source of truth: listings, calendar, prices RON, reservations, reviews)
   │  cron sync every 15 min (+ daily BNR cron)
   ▼
Supabase (cache + system of record for users/bookings/services/reviews/fx)
   │  server components / route handlers (RLS enforced)
   ▼
Next.js 15 App Router (ISR 15 min for stays; SSG marketing; SSR member area)
   │
   ├─ Stripe Checkout (Wave 5): rooms + services as line items, EUR
   │     └─ webhook → create N Hostaway reservations → confirm booking → Brevo email
   └─ Google Maps Embed API: stay pages + location pages (StylizedMap stays on /locations overview)
```

Key principles (unchanged from ARCHITECTURE.md): availability reads ALWAYS from
Supabase; live Hostaway price re-check immediately before payment; webhook-driven
reservation creation; never call Hostaway from the client.

**Currency engine:** `lib/fx.ts` — daily cron fetches BNR XML (bnr.ro), stores in
`exchange_rates`; all RON→EUR conversion goes through one function implementing D2.
Stripe charges EUR; booking rows store both RON base and EUR charged + rate used.
Hostaway reservation gets the financial breakdown in notes/custom fields —
exact field mapping verified at build (depends on Hostaway↔Stripe native
connection state, see Open Questions).

## 4. Stripe-deferred strategy

- `lib/payments/provider.ts` defines the interface (createCheckout, verifyWebhook,
  refund). Wave 4 ships a **stub provider** behind `PAYMENTS_ENABLED=false`: checkout
  flow works end-to-end up to the pay step, which shows a "Bookings open soon" state
  on preview. No public booking until Stripe lands.
- When Robert gets Stripe access: add keys, implement `StripeProvider`, register
  webhook, flip flag. No refactor.

## 5. Database schema (Supabase, Frankfurt)

- `profiles` (extends auth.users): full_name, phone, marketing_consent, total_trips
- `buildings`: id, name, address, neighborhood_slug, lat/lng — groups sibling suites (Robert confirms unit→building mapping)
- `properties`: id (Hostaway listingId), building_id FK, slug UNIQUE, name, subtitle, neighborhood, description, content JSONB (amenities, FAQs, nearby — preserves current `Property` type), images JSONB, max_guests, bedrooms, bathrooms, price_from_ron, active, last_synced_at
- `availability`: (property_id, date) PK, available, price_ron, min_stay
- `exchange_rates`: (date, currency) PK, rate — BNR daily
- `services`: id, name, description, price_ron OR price_eur, unit (per_stay/per_night/per_person), active, sort
- `bookings`: id UUID, order_id UUID (groups multi-room), user_id, property_id, hostaway_reservation_id, check_in/out, guests, rate_plan (locked/flexible), subtotal_ron, fx_rate, total_eur, status (pending/confirmed/cancelled), stripe_session_id, payment_intent_id, guest fields, business invoice fields (nullable: company, VAT/CUI, reg_com, address)
- `booking_services`: booking_id, service_id, qty, unit_price_eur
- `reviews`: id, property_id, source (hostaway/manual), author, rating, text, stayed_at, published
- RLS: bookings/profiles owner-only; properties/availability/reviews/services public read; service-role for sync. Types via `npm run db:types` (script added Wave 0).

## 6. Work plan — waves (usage-limit-safe chunks)

> Every wave ends: green lint+typecheck, committed, pushed, resume note in
> LEARNINGS.md. Waves are independent enough to pause between any two.

- **Wave 0 — Foundations:** Supabase project + schema + RLS + generated types; env vars wired (`.env.example` updated); `lib/fx.ts` + BNR cron; `db:*` npm scripts; no UI change.
- **Wave 1 — Hostaway sync:** `lib/hostaway/client.ts` (OAuth2 token, listings, calendar, priceDetails, reviews; 60 req/min limiter, retries); `/api/sync/hostaway` + Vercel cron 15 min + manual trigger (SYNC_SECRET); adapter Hostaway→`Property` type; stays/locations pages read from Supabase (ISR 15 min). UI looks identical, data is real.
- **Wave 2 — Auth + member area:** Supabase Auth (@supabase/ssr middleware), Google + email; replace localStorage demo in Nav/LoginForm/Checkout gate/MyTrips/Profile; remove DemoModeToggle; profile persistence; `noindex` member pages.
- **Wave 3 — Availability, pricing UI, multi-room:** calendar fed by `availability`; EUR pricing everywhere via fx engine; two rate plans (new names); sibling-suites section on stay pages + "Add another room" same-dates cart (D6); price breakdown with per-line items.
- **Wave 4 — Booking flow (payment-stubbed):** pending booking creation, live Hostaway price re-check, checkout steps on real data incl. business invoice fields, PaymentProvider stub (D1/§4).
- **Wave 5 — Stripe + emails (when access ready):** StripeProvider, Checkout session (rooms+services line items, EUR), webhook (signature verify → N Hostaway reservations → confirm → Brevo); Brevo templates: confirmation, pre-arrival 24h (door PIN — source verified at build), cancellation; idempotency + cleanup cron for expired pending bookings.
- **Wave 6 — SEO + analytics + polish:** canonicals everywhere; homepage title/description/H1 fix (primary keyword); OG/Twitter images; `not-found.tsx` + `error.tsx`; security headers; GA4 + PostHog EU + cookie consent; `/locations/[slug]` pages (4 × 800+ words — Fable drafts, Robert approves) with Google Maps Embed; slug 301s; sitemap update; icon-in-tile fix + design-drift cleanup (BRAND.md known-drift lists); video-ready hero slot.
- **Wave 7 — QA + launch prep:** /qa pass, Lighthouse 95+, real-device test, Rich Results validation, Search Console; production env checklist; **the only wave that touches `vercel.json`/coming-soon, on `main`, with explicit approval**.

## 7. Environment variables

Public: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Wave 5), `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
Server-only: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (Wave 5),
`HOSTAWAY_ACCOUNT_ID`, `HOSTAWAY_API_KEY`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`,
`BREVO_SENDER_NAME`, `SYNC_SECRET`, `CRON_SECRET`.
Google OAuth credentials go in Supabase Auth providers, NOT Vercel. No NextAuth vars
(INTEGRATIONS.md correction).

## 8. Out of scope (Phase 6+)

Guides/blog, i18n, PWA, loyalty +10% after 3 trips (UI exists; logic post-launch),
Apple Sign-In (until dev account), admin dashboard (services edited via Supabase
Studio initially), Hostaway webhooks (poll-sync first; webhooks if plan supports).

## 9. Risks

| Risk | Mitigation |
|---|---|
| Hostaway↔Stripe native connection double-charges | Verify account config before Wave 5; our flow records payment as external on the reservation |
| FX drift between booking and settlement | +3% margin (D2); rate snapshot stored per booking |
| Hostaway reviews endpoint not on plan | Fallback manual curated reviews (D9) |
| Demo→real data breaks UI | `Property` type frozen; adapter layer; visual QA per wave |
| Usage-limit pause mid-wave | Waves end committed+pushed with resume notes |

## 10. Open items for Robert

1. **Rate plan naming** (replaces NUMA's Saver/Flex) — shortlist:
   (a) **Locked Rate / Open Rate** (plays on the "Unlocked" brand motif),
   (b) **Set Rate / Free Rate**, (c) descriptive: **Best Price (non-refundable) / Flexible (free cancellation)**. Pick or counter-propose.
2. **Unit → building mapping** for multi-room (which of the 8 suites share buildings).
3. **Final services list + prices** (early/late check-in/out, breakfast, transfer, parking…).
4. **Member −15% final mechanics** (D4 is provisional).
5. **Door PIN source** for pre-arrival email (Hostaway field? smart-lock system?).
6. **GA4 + PostHog accounts** — create and provide IDs (Wave 6).
7. **Stripe access timing** (gates Wave 5).
8. Free-cancellation window: 5 days OK, or different?
