# Plan — Stripe checkout → Hostaway reservation (RON-first)

**Rev 2 — 2026-07-02** (supersedes Rev 1 after client decisions) · **Status: approved, building** · Stripe TEST first, live at launch.

## Locked decisions (client, 2026-07-02)
1. **RON is the money of record.** Real price computed and CHARGED in RON, always (Stripe currency `ron`; Hostaway reservation records the same RON total).
2. **Display currencies: EUR (default), RON, USD** via a switcher. Display-only division: `AVEXA_FX_RATE_EUR=5.25`, `AVEXA_FX_RATE_USD=4.65` (env, configurable). Variant A: compute RON → divide for display.
3. **Accommodation formula (per night):** `ceil(base_RON × 1.18 × 1.03)` — multiplicative, confirmed. Env: `AVEXA_MARKUP_PERCENT=18`, `AVEXA_PAYMENT_FEE_PERCENT=3` (renamed from AVEXA_FX_MARGIN_PERCENT). Shown as ONE "total price" line, never the split.
4. **City tax: 10 RON / night / person, STRICT** on every reservation. Separate "City Tax" line, NO markup/fee (pass-through). Always real RON; show "≈ equivalent" when display ≠ RON.
5. **VAT included** in the final price — never added on top. Show "VAT included" near the total. (Whether Hostaway base is VAT-inclusive → confirm with client before live; doesn't change code structure.)
6. **Extras = variant (ii):** priced from DB (`services`/`booking_services`), sent to Stripe as inline `price_data` line items — NOT Stripe products. Separate "Extra services" line. (Extras still mock per listing; wiring ready for when they're final.)
7. **Checkout breakdown:** Accommodation total → Extra services (if any) → City Tax (RON + equivalent) → TOTAL (charged RON, displayed in selected currency) + "VAT included".
8. **Login mandatory, members only** (`user_id NOT NULL`), never guest checkout.
9. **Single-room v1** + HIDE "add room" UI on stay pages (re-enable at multi-room phase).
10. **Payment architecture:** Stripe on OUR site only — do NOT use Hostaway's Stripe integration (double-ownership risk). Flow: Stripe → webhook → website → Hostaway API. Hostaway gets the reservation record (`isPaid=1`, full RON total), never the money.
11. **Hostaway reservation:** `totalPrice` = full amount charged (RON), currency RON, ALL guest + reservation data transmitted (client invoices from Hostaway; NO e-Factura module in code).
12. **forceOverbooking=0 + auto-refund on conflict — in v1** (premium brand: refund > double-booking). Conflict → Stripe refund + booking `cancelled` + minimal email to guest.
13. **Confirmation email: sent by Hostaway** (client verifies the automation). We do NOT build a booking-confirmation email. **Resend stays** for auth emails (Supabase SMTP, done) + the ONE minimal refund-conflict email (app-side, needs `RESEND_API_KEY` in Vercel).
14. **Testing (c)→(b):** build with Hostaway creation MOCKED (`HOSTAWAY_MOCK_RESERVATIONS=1`) → test Stripe+DB end-to-end on preview (4242) → then ONE controlled real test on far-off dates, cancelled after. Never pollute the real PMS.

## Phases
- ✅ **P0 — RON-first pricing core:** `lib/pricing.ts` rewrite (accommodationRonPerNight, cityTaxRon, display rates env), new client-safe `lib/currency.ts` (format/convert), availability + live-pricing + static catalog → RON semantics, env renames, `rules/pricing.md` rewrite, dead `lib/fx.ts` code removed.
- ✅ **P1 — display layer (delegated slices):** CurrencyProvider + Nav switcher; sidebar/checkout RON breakdown per decision 7 + add-room hidden; cards + map pins + JSON-LD conversion. (commit "feat(currency): EUR/RON/USD display…")
- ✅ **P2 — DB + integration libs:** migration `003_stripe.sql`; stripe + zod installed; `lib/stripe/client.ts`; Hostaway `hostawayPost` + `createReservation` (+ `HOSTAWAY_MOCK_RESERVATIONS`); `lib/booking/quote.ts` (live calendar read; skipped `calculatePrice` — decision 11 records OUR charged total).
- ✅ **P3 — `/api/checkout`:** session auth + Zod + server quote + pending insert + Stripe session (RON) + PaymentStep wiring (fake card form removed — Stripe hosts payment).
- ✅ **P4 — webhook:** raw-body signature, double idempotency, Hostaway reservation (forceOverbooking=0), refund-on-failure + cancel + minimal Resend notice.
- ✅ **P5 — confirmation + guards:** `/book/confirmation` (confirmed/pending-poll/refunded), `requireUser` on /checkout /my-trips /profile, fake ConfirmationStep deleted, sidebar flex ratio mirrors quote. (commit "feat(booking): real Stripe checkout…")
- ✅ **P6a — end-to-end MOCK test on preview (2026-07-02): PASSED.** Full browser run: login (session cookie + server guard OK) → The Little Gem, Sep 14–17, 2 adults → checkout (contact → PaymentStep) → Stripe hosted page (RON 864.00; line items accommodation 804 + city tax 60; email prefilled) → 4242 → redirect `/book/confirmation` → **BOOKING CONFIRMED**. DB verified: booking `confirmed`, accommodation 804 + tax 60 = 864 RON, display EUR@5.25, `hostaway_reservation_id=-629323949` (negative ⇒ mock, PMS untouched), stripe session+PI stored, 1 processed event, availability Sep 14–16 blocked (17 = checkout, corect). Sidebar "charged as 864 RON" == Stripe total == DB total.
- ✅ **P6b — REAL test + idempotency (2026-07-02): PASSED, cleanup pending.** Idempotency: Stripe Resend on `evt_1Tohd...` → 200, DB unchanged (1 event, 1 booking). Real test: mock removed → Little Gem Nov 17–19 ×2 → Stripe RON 588 (548+40) → **Hostaway reservation `62347427` (real)**, guest "Robert Ilie (TEST)", 588 RON, full comment; calendar Nov 17+18 `reserved` (~30s propagation), Nov 19 open (checkout day); our cache blocked instantly. **Finding: Hostaway ignores `isPaid:1` on POST** → `isPaid:null`, `paymentStatus:"Unknown"`, `status:"modified"` — needs follow-up fix (PUT after create or payment record). Cleanup DONE: 62347427 cancelled from dashboard → Hostaway calendar freed (verified) → sync run → cache freed (Nov 17–18 + stale Sep 14–16 mock block) → both test bookings marked cancelled in DB. Still pending: isPaid fix decision; confirm Hostaway guest-confirmation email arrived (decision 13); re-add `HOSTAWAY_MOCK_RESERVATIONS=1` on Preview until launch.
- **P7 — senior review sweep (the /goal):** multi-agent whole-codebase review — security, correctness, clean-code, SEO fixes from QA, shippable/sellable quality bar.

## Setup (Robert)
- Vercel env (Preview): `RESEND_API_KEY` (conflict-refund email), later `STRIPE_WEBHOOK_SECRET` (after P4 deploy: Stripe dashboard test → add endpoint `https://<preview>/api/webhooks/stripe` → `checkout.session.completed` → copy `whsec_`).
- Vercel env (optional now, required at launch): `AVEXA_MARKUP_PERCENT=18`, `AVEXA_PAYMENT_FEE_PERCENT=3`, `AVEXA_FX_RATE_EUR=5.25`, `AVEXA_FX_RATE_USD=4.65` (code defaults already match).
- Apply migration `003_stripe.sql` in Supabase (SQL provided at P2).
- Hostaway: verify guest-confirmation automation is ON for new direct reservations; verify listings have NO own payment processing (we charge via Stripe only).
