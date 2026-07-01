# Plan — Stripe checkout → Hostaway reservation → confirmation

**Date:** 2026-07-01 · **Status:** awaiting approval · **Mode:** Stripe TEST first, then live at launch.

## Goal
Turn the current localStorage checkout simulation into a real flow: guest pays via Stripe Checkout → webhook creates a Hostaway reservation + persists the booking → confirmation email. All on the `feat/nextjs-platform` preview with test card `4242`.

## Current state (from research)
- **`bookings` table already exists** (`db/migrations/001_init.sql:86-118`) with all needed columns (order_id, user_id, property_id, hostaway_reservation_id, subtotal_ron, fx_rate, total_eur, status, stripe_session_id, guest_*, invoice_*). Schema-only — never written yet. RLS = select-own; writes go through service-role (`getSupabaseAdmin`).
- **Hostaway client is read-only** (`lib/hostaway/client.ts`): token flow + rate-limit throttle solved; only GET helpers. Property→listing map done (`lib/hostaway/mapping.ts`, `properties.hostaway_listing_id`).
- **No** `lib/stripe/`, `/api/checkout`, or `/api/webhooks/stripe`. `stripe` SDK not installed. `STRIPE_*` env referenced but unset.
- **The seam:** `components/checkout/PaymentStep.tsx:26-29` (fake card form → `onNext()`). Replace with server call → Stripe.
- **No server auth guard** on `/(member)` — only client localStorage check.

## Security guarantees baked in (the 2 QA blockers)
1. **Price is server-derived, never client-sent.** `/api/checkout` accepts only `propertyId/checkIn/checkOut/guests`, re-checks availability + price server-side (Hostaway `calculatePrice` + `lib/pricing`), and creates the Stripe session with the server amount. Client `total` is UI-only.
2. **Identity from the Supabase session.** `user_id` comes from `getSupabaseServerClient().auth.getUser()` in the checkout route (never localStorage). Server guard added to `/(member)`.

## Architecture
```
StayBookingSidebar → /checkout (ContactInfo → Pay)
  Pay → POST /api/checkout {propertyId,checkIn,checkOut,guests, contact}
     → auth.getUser(); quote = Hostaway calculatePrice (RON) → member EUR via lib/pricing
     → insert bookings rows status=pending (service-role), order_id
     → Stripe Checkout Session (EUR cents, metadata=booking) → return session.url
  → redirect to Stripe → guest pays (4242)
  → success_url /book/confirmation?session_id=... (reads real booking)
Stripe → POST /api/webhooks/stripe (raw body, verify sig, runtime=nodejs)
  → checkout.session.completed & paid → idempotent (stripe_session_id UNIQUE + processed_stripe_events)
     → Hostaway createReservation (channelId 2000 direct, currency RON, isPaid 1)
     → update booking status=confirmed + hostaway_reservation_id
     → optimistic availability write; send confirmation email (Resend)
```

## Phases (commit + review each)
- **P0 — DB migration `003_stripe.sql`:** add `stripe_session_id UNIQUE` on bookings; `processed_stripe_events(event_id text pk, created_at)`. Apply to Supabase.
- **P1 — server libs:** `npm i stripe`; `lib/stripe/client.ts` (singleton); extend `lib/hostaway/client.ts` with `hostawayPost`, `calculatePrice`, `createReservation`; `lib/booking-quote.ts` server quote (propertyId+dates+guests → live availability + RON + member EUR).
- **P2 — `/api/checkout/route.ts`:** session auth, server quote, insert pending bookings, create Stripe session, return url. Wire `PaymentStep` → fetch → `window.location.href`.
- **P3 — `/api/webhooks/stripe/route.ts`:** raw body + signature, idempotent handler, Hostaway reservation, booking→confirmed, email, availability write.
- **P4 — confirmation + guard:** `/book/confirmation` reads real booking; server guard in `app/(member)/layout.tsx`; replace fabricated `ConfirmationStep`.
- **P5 — test on preview:** register webhook in Stripe dashboard (get `whsec_`), test 4242 end-to-end (booking row + Hostaway reservation + email), verify idempotency.

## Open decisions (defaults chosen; confirm before go-live)
1. **Hostaway `totalPrice` basis.** Default: record Hostaway's own `calculatePrice` RON on the reservation; guest is charged our member EUR (base + 18% markup + FX); the markup difference is AVEXA's margin, tracked in the bookings row (`subtotal_ron` vs `total_eur`), not inside Hostaway. → confirm with client this matches their owner-payout/accounting model.
2. **`forceOverbooking`.** Default for v1: `1` (trust the live pre-check + our idempotency) — avoids a failed booking after a successful charge. Hardening follow-up: `0` + auto-refund-on-conflict. → confirm risk appetite.
3. **Calendar auto-block** unconfirmed in docs → verify in staging that a created reservation blocks the dates; else add `PUT /listings/{id}/calendar`.

## Setup the user must do
- Add **`RESEND_API_KEY`** to Vercel env (Preview) — app-sent booking emails need it (separate from the Supabase SMTP config used for auth emails). Also `NEXT_PUBLIC_BASE_URL` = preview URL.
- After P3 deploys: Stripe Dashboard (test) → Developers → Webhooks → add `https://<preview>/api/webhooks/stripe` → subscribe `checkout.session.completed` → copy `whsec_` → Vercel env `STRIPE_WEBHOOK_SECRET`.
- Apply migration `003` to Supabase.
