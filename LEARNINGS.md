# AVEXA — Session Learnings

> Self-improving knowledge base. Read at the start of every session,
> update at the end. Captures patterns, mistakes, and useful snippets.
> Populated 2026-06-12 from full git-history + code audit.

---

## 💳 PLĂȚI — referință consolidată (la zi: 2026-07-02, P0→P6a done)

> Sursa de adevăr pentru tot ce s-a decis și construit pe plăți. Regulile sunt
> codificate și în `.claude/rules/pricing.md` + `.claude/rules/hostaway.md` +
> `.claude/rules/api-validation.md` (se încarcă automat pe fișierele relevante).

### Deciziile clientului (locked)
1. **RON = banul real.** Se calculează și se ÎNCASEAZĂ mereu în RON (Stripe currency
   `ron`); Hostaway înregistrează același total RON. EUR (default) / RON / USD = doar
   AFIȘARE, prin împărțire la rate fixe env: `AVEXA_FX_RATE_EUR=5.25`,
   `AVEXA_FX_RATE_USD=4.65`. Switcher în nav (desktop + mobile overlay).
2. **Formula cazare/noapte:** `ceil(base_RON × 1.18 × 1.03)` — multiplicativ (+21.54%).
   Env: `AVEXA_MARKUP_PERCENT=18` (marja AVEXA) + `AVEXA_PAYMENT_FEE_PERCENT=3` (cost
   procesare; REDENUMIT din `AVEXA_FX_MARGIN_PERCENT`). Knobs server-only, niciodată
   per-listing, niciodată în client.
3. **City tax: 10 RON/noapte/persoană STRICT** (adults+children; infants nu), pass-through
   FĂRĂ markup/fee, mereu RON real + „≈ echivalent" la afișare non-RON.
4. **Contractul de breakdown la checkout (identic peste tot):** Accommodation (O linie,
   fără split 18%/3%) → Extra services (linie separată, doar dacă există) → City tax
   (linie separată) → Total + „charged as X RON" + „VAT included". Se respectă în:
   sidebar → BookingSummary/PaymentStep → line items Stripe → coloane DB.
5. **TVA inclus** în preț, nu se adaugă nimic; caption „VAT included". (De confirmat cu
   clientul că baza Hostaway e cu TVA inclus — nu blochează codul.)
6. **Extras = varianta (ii):** preț din DB (`services`/`booking_services`; momentan doar
   breakfast 105 RON/zi/pers din catalogul de upgrades), trimise la Stripe ca
   `price_data` inline — NICIODATĂ produse în catalogul Stripe.
7. **Login obligatoriu, doar membri** (`user_id NOT NULL`); niciodată guest checkout.
8. **Single-room v1**: UI-ul „Add another room" ASCUNS (`MULTI_ROOM_ENABLED=false` în
   StayBookingSidebar — flip la faza multi-room; logica a rămas cablată).
9. **Arhitectura plății: DOAR Stripe-ul nostru pe site.** NU se folosește integrarea
   Stripe din Hostaway (dublă-deținere = risc dublă-taxare). Flux: site → Stripe →
   webhook → site → Hostaway API. Hostaway primește doar ÎNREGISTRAREA (isPaid=1,
   totalul RON complet plătit, channelId 2000 „direct", provider=avexastays), niciodată bani.
10. **forceOverbooking=0 + refund automat în v1**: orice eșec la crearea rezervării după
    plată ⇒ refund integral Stripe (idempotency key `refund_<sessionId>`) + booking
    `cancelled` + email minimal. Brand premium: NICIODATĂ dublă-rezervare.
11. **Emailul de confirmare îl trimite HOSTAWAY** (automatizările clientului — de
    verificat că-s pornite). App-ul trimite UN singur email: refund-conflict, prin
    Resend HTTP (`lib/email/resend.ts`, expeditor office@avexastays.com).
12. **Facturarea se face din Hostaway** (fără modul e-Factura în cod) — de-aia TOATE
    datele (breakdown, invoice company/VAT/RegCom/adresă, display context, Stripe ids)
    merg în `comment`-ul rezervării Hostaway.
13. **Testare: mock-first** (`HOSTAWAY_MOCK_RESERVATIONS=1` ⇒ id rezervare NEGATIV, PMS
    neatins), apoi UN test real controlat pe date îndepărtate, anulat după.

### Harta codului (unde modifici ce)
- **Formula + knobs:** `lib/pricing.ts` (accommodationRonPerNight, cityTaxRon,
  getDisplayRates; server-only). **Afișare:** `lib/currency.ts` (client-safe: formatMoney,
  formatApproxEquivalent, CITY_TAX_RON_PER_PERSON_NIGHT) + `components/currency/`
  (CurrencyProvider — rates vin din layout server; CurrencySwitcher în Nav).
- **Quote server = SINGURA sursă de preț pt. bani:** `lib/booking/quote.ts` — citește
  calendarul LIVE Hostaway (nu cache-ul!), aplică formula per noapte, flex = raportul
  flex/saver din catalog (sidebar-ul oglindește EXACT același calcul via `rateFactor`).
- **Checkout API:** `app/api/checkout/route.ts` — identitate din sesiunea Supabase, Zod
  (clientul trimite DOAR id/date/oaspeți/contact — NICIODATĂ preț), insert booking
  `pending` (service-role), sesiune Stripe RON (bani = ×100), `idempotencyKey
  checkout_<bookingId>`, redirect `session.url`. La eșec sesiune ⇒ booking `cancelled`.
- **Webhook:** `app/api/webhooks/stripe/route.ts` — `runtime='nodejs'`, RAW body
  (`req.text()`, NICIODATĂ `req.json()` — semnătura pică), dublă idempotență
  (`processed_stripe_events` fast-path + lock pe rândul de booking:
  status/hostaway_reservation_id), `createReservation` → confirmed + blocare optimistă
  availability; orice throw ⇒ refund + cancelled + email; refund eșuat ⇒ 500 (Stripe
  reîncearcă, cheile idempotente fac retry-ul sigur).
- **Hostaway write:** `lib/hostaway/client.ts` — `hostawayPost` (throttle + 403-retry ca
  GET) + `createReservation` + `HostawayApiError`; mock flag; tipuri în
  `lib/hostaway/types.ts`. Convenții Hostaway: booleeni ca 0/1, `numberOfGuests` =
  adults+children+infants, fără idempotență nativă (a noastră e în DB).
- **UI checkout:** `components/checkout/PaymentStep.tsx` (FĂRĂ formular de card — Stripe
  găzduiește; POST → redirect; stări 401/409/network), CheckoutApp 2 pași (fostul
  ConfirmationStep fals ȘTERS), confirmarea reală = `app/book/confirmation/page.tsx`
  (confirmed/pending-poll/refunded; `BookingConfirmedEffects` curăță draftul local).
- **Guards:** `lib/auth/server.ts` → `requireUser()` pe paginile /checkout, /my-trips,
  /profile (mirror-ul localStorage NU e autorizare).
- **DB:** `db/migrations/003_stripe.sql` — coloane RON (accommodation/extras/city_tax/
  total), adults/children/infants, `extras` jsonb, display_currency/display_fx_rate,
  UNIQUE `(stripe_session_id, property_id)` (multi-room-proof), `processed_stripe_events`
  (RLS on, fără politici = doar service-role). `types/database.types.ts` ținut manual în sync.
- **Strat de date RON:** catalogul static `lib/properties.ts` convertit ×5.25 (round-trip
  exact la vechile prețuri EUR), `DayPrice.ron` în availability, applyLivePricing → RON,
  upgrades RON (breakfast 105).

### Env & servicii (cine unde stă)
- **Vercel Preview:** `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  (sandbox), `STRIPE_WEBHOOK_SECRET` (whsec al destinației), `HOSTAWAY_MOCK_RESERVATIONS=1`,
  `RESEND_API_KEY`. Pricing knobs opționale (default-urile din cod = spec).
- **Stripe sandbox:** destinație „Avexa checkout" → DOAR `checkout.session.completed` →
  URL-ul de BRANCH (stabil): `.../api/webhooks/stripe`. **La lansare:** endpoint separat
  pe domeniul de producție + chei live în Production + scoate mock-ul.
- Gotcha Vercel: env-urile intră DOAR la deploy nou (am declanșat redeploy cu commit gol);
  probe rapid: POST fără semnătură ⇒ 400 `missing_signature`; cu semnătură falsă ⇒ 400
  `invalid_signature` (dacă whsec e văzut) vs 500 `not_configured` (dacă lipsește).

### Fix-uri făcute pe drum (relevante pt. bani)
- **TZ date shift**: `toISOString().slice(0,10)` muta check-in/out cu o zi în RO — înlocuit
  cu `ymd()` (altfel rezervai altă noapte decât plăteai!).
- **Reset parolă 404** (`/auth/reset-password` → `/reset-password`) — flux auth reparat.
- **QuoteExtra ca `type` (nu `interface`)** — altfel nu satisface `Json` la insert (index
  signature implicită există doar pe type-aliasuri).
- **Build crash `WasmHash ... reading 'length'`** = cache `.next` corupt pe Windows ⇒
  `rm -rf .next`, NU e eroare de cod.

### Dovezi test (P6a mock, 2026-07-02 — PASSED)
Login → Little Gem Sep 14–17 ×2 → Stripe **RON 864.00** (804 cazare + 60 city tax, linii
separate, email precompletat) → 4242 → **BOOKING CONFIRMED** (≈ €164.57). DB: confirmed,
864 RON, `hostaway_reservation_id=-629323949` (mock), 1 event procesat, availability
14–16 blocată. **Sidebar = Stripe = DB.** Test user: `checkout-test@avexastays.com`.

### Dovezi test (P6b, 2026-07-02 — PASSED, cleanup pending)
- **Idempotență:** Resend din Stripe Workbench pe `evt_1Tohd...` → 200; DB neschimbat
  (tot 1 event procesat, tot 1 booking, același reservation id). Dubla apărare confirmată.
- **Test REAL Hostaway:** mock scos din Vercel → redeploy → Little Gem **17–19 nov 2026**
  ×2 adulți → Stripe **RON 588.00** (548 cazare + 40 city tax) → confirmare →
  **`hostaway_reservation_id=62347427` (pozitiv = real)**. Hostaway: guest „Robert Ilie
  (TEST)", totalPrice 588 RON, channelId 2000, comment cu tot breakdown-ul; calendar
  **17+18 nov = reserved** (propagare ~30s; 19 = checkout day rămâne liber, corect);
  cache-ul nostru blocat optimist instant. Checkout breakdown contract OK:
  Accommodation €104 / City tax (≈ €7.62) / Total €112 „charged as 588 RON, VAT included".
- **✅ REZOLVAT — starea de plată în Hostaway (test #2, Dec 8–10, rez. 62358420):**
  `isPaid` e IGNORAT și la POST și la PUT (verificat live). Starea de plată se derivă
  din **guest-payment charges**: `POST /v1/guestPayments/charges/{reservationId}` cu
  `{title, description, amount, paymentMethod: "other", status: "paid", scheduledDate}`
  → `paymentStatus: "Paid"`. `paymentMethod: "stripe"` NU merge (rezervat gateway-ului
  conectat al contului → „Internal error" 403); „other" + titlu descriptiv e corect.
  Implementat în `createReservation` (best-effort, nu pică booking-ul). `status:
  "modified"` în loc de `new` = comportament normal Hostaway post-creare, benign.
- **Emailul de confirmare (decizia 13 REVIZUITĂ 2026-07-02):** clientul folosește
  **ChargeAutomation.com** (terț) — generează linkul de check-in și îl scrie în notele
  rezervării (`CA_PRE_ARRIVAL_LINK`, latență 9–60s), dar NU trimite email guestului
  pentru rezervări direct/API. **Soluția noastră (implementată):**
  `lib/hostaway/confirmation.ts` — după confirmarea booking-ului (în `after()` din
  next/server, nu ține webhook-ul Stripe), așteptăm linkul CA (~95s max), compunem
  confirmarea (date, oaspeți, total plătit RON, link check-in) și o trimitem pe
  **conversația Hostaway** cu `communicationType: email` → guestul primește email +
  mesajul rămâne vizibil în inbox-ul Hostaway (și răspunsurile guestului la fel).
  Fallback: Resend (`RESEND_API_KEY` în Vercel). Best-effort — nu pică booking-ul.
- **✅ Test #3 (Dec 15–17, rez. 62359556, 2026-07-02) — TOTUL VERDE, mistere rezolvate:**
  - **Status „modified" NU e de la noi** — timeline prins live: 19:39:35 status `new`
    + `paymentStatus: Paid` (charge-ul automat din cod!), 19:39:44 status devine
    `modified` EXACT când ChargeAutomation își scrie linkul în note. Fix posibil doar
    în setările CA / întrebare la suportul CA (la Airbnb nu flipează pt. că CA nu
    scrie nota acolo).
  - **financeField funcționează:** dashboard-ul arată „Base rate 560 / City / Tourism
    tax 40 / Total 600 / Total paid 600" — exact structura cerută (ca la Airbnb).
  - Charge automat unic (600 RON, „Paid via Stripe on avexastays.com", la ~3s după
    creare); calendar Hostaway 15–16 dec `reserved` (17 = checkout liber); cache-ul
    nostru blocat instant.
- **Cleanup DONE (2026-07-02):** rezervarea 62347427 anulată din dashboard (11:25) →
  calendar Hostaway eliberat instant → sync rulat (8 proprietăți × 181 zile) → cache
  eliberat (Nov 17–18 + blocajul vechi Sep 14–16 de la mock) → ambele booking-uri de
  test marcate `cancelled` în DB. **Ciclul complet demonstrat, inclusiv self-healing.**
- **⚠ Post-test:** preview-ul a rămas FĂRĂ mock — orice plată test pe preview creează
  rezervări REALE în PMS. Recomandat: repune `HOSTAWAY_MOCK_RESERVATIONS=1` în Vercel
  Preview până la lansare.

- **✅ Test #5 (Nov 10–12, rez. 62360739) — fluxul complet de email VERIFICAT:**
  mesaj `sent` pe conversația Hostaway la +40s după plată, cu TOT conținutul: date,
  2 oaspeți, „Total paid: 588 RON (VAT included)", **linkul CA de check-in inclus**,
  breakdown în PMS (Base rate 548 / City tax 40), `Paid`. (Testul #4/62360545 a ieșit
  fără link — fereastra de 26s era sub latența CA; lărgită la ~95s.)
- **✅ Bucla ÎNCHISĂ (2026-07-02):** Robert a primit emailul cu linkul, a completat
  check-in-ul ca guest, iar CA a scris totul înapoi în rezervare: date guest, telefon
  actualizat, ora sosirii, întrebarea de facturare, `CA_PRE_CHECKIN_COMPLETE: Yes` —
  identic cu fluxul rezervărilor de pe Booking. Decizia 13 (revizuită) e completă.
- **💡 Plan viitor (client, 2026-07-02): înlocuirea ChargeAutomation cu tool propriu**
  construit cu Claude Code (scapă de abonament). Funcțiile de replicat: link securizat
  de check-in per rezervare (pe domeniul nostru), formular guest (date, oră sosire,
  facturare), write-back în Hostaway (infra există deja), upsell-uri plătite prin
  Stripe (ex. 1PM Late Check-out), programare emailuri pe conversația Hostaway
  (infra există deja). Fezabil; de planificat post-lansare — NU acum.

### Rămase pe plăți
- **Rezervări de test active în PMS (de anulat din dashboard după verificări):**
  62358420 (Dec 8–10), 62359556 (Dec 15–17), 62360545 (Nov 24–26, emailul fără link),
  62360739 (Nov 10–12, emailul complet cu link CA) → apoi resync + mark cancelled în DB.
- **Sync gap:** cerință client = sub 15 min. Recomandare: **Hostaway Unified Webhooks**
  (`POST /v1/webhooks/unifiedWebhooks` — cele pe `/webhooks/reservations` sunt marcate
  deprecated) → endpoint `app/api/webhooks/hostaway` care upsertează availability la
  orice eveniment de rezervare (secunde în loc de ≤15 min); cron-ul rămâne backstop.
- **Client:** verifică emailul CA în inbox/spam; config CA (scope canale) dacă lipsește;
  întrebare la CA de ce scrie nota (flip „modified") doar la rezervările API.
- **La lansare:** chei live + webhook de producție + fără mock; confirmă automatizarea
  de email Hostaway + că listing-urile n-au procesare de plată proprie; confirmă TVA
  inclus în baza Hostaway; multi-room (flip `MULTI_ROOM_ENABLED` + order_id există deja).

## ⏯ Session Resume Notes (newest first)

### 2026-07-02 — CONFIRMAT (client): contractul de afișare a prețului la checkout
- **Breakdown-ul pe linii e obligatoriu și fix:** (1) **Accommodation** = prețul real al
  cazării pe O singură linie (fără să se vadă vreodată split-ul 18%/3%); (2) **Extra
  services** pe linie separată doar dacă există; (3) **City tax** pe linie separată,
  mereu în RON real + echivalent „≈ €X.XX" când moneda de afișare ≠ RON; (4) **Total** +
  „charged as X RON" + „VAT included". NU colapsa niciodată city tax în linia de cazare
  și nu arăta un singur total fără breakdown. Contractul se aplică IDENTIC în: sidebar
  (stay page) → BookingSummary/PaymentStep (checkout) → line items Stripe → coloane DB
  (`accommodation_ron`/`extras_ron`/`city_tax_ron`/`total_ron`). Regula e codificată și
  în `.claude/rules/pricing.md`; verificat live în testul E2E (804 + 60 = 864 RON).

### 2026-07-02 — RON-first pricing + REAL Stripe checkout built (P0→P5)
- **Money model changed (client decisions, plan rev 2):** RON = money of record, charged via
  Stripe in RON; EUR (default)/RON/USD are display-only (`AVEXA_FX_RATE_EUR=5.25`,
  `AVEXA_FX_RATE_USD=4.65`); formula `ceil(base_RON×1.18×1.03)`; city tax 10 RON/night/pers
  pass-through pe linie separată; VAT included; `AVEXA_FX_MARGIN_PERCENT` renamed →
  `AVEXA_PAYMENT_FEE_PERCENT`. Catalog static + availability + upgrades toate în RON.
- **Full checkout flow LIVE in cod (comituri: currency display + booking core):**
  `/api/checkout` (sesiune+Zod+quote live Hostaway+insert pending+Stripe session RON) →
  Stripe → `/api/webhooks/stripe` (raw body, dublă idempotență, createReservation
  forceOverbooking=0, refund automat la orice eșec + email Resend minimal) →
  `/book/confirmation`. Guards server (`requireUser`) pe /checkout /my-trips /profile.
  `HOSTAWAY_MOCK_RESERVATIONS=1` pt. test fără PMS real. PaymentStep fără card fals.
- **Orchestration docs made model-agnostic** (CLAUDE.md near-top section + efficient-fable
  skill rewritten; `CLAUDE_CODE_SUBAGENT_MODEL` controls subagent models).
- **Gotcha:** webpack `WasmHash ... reading 'length'` la build = cache `.next` corupt
  (Windows) → `rm -rf .next` și rebuild; NU e eroare de cod.
- **P6a MOCK E2E TEST: PASSED (2026-07-02)** — setup complet (migrația 003 rulată, webhook
  Stripe sandbox „Avexa checkout" pe `checkout.session.completed`, env-uri Preview).
  Browser flow complet verificat: login → Sep 14–17 ×2 adulți → Stripe RON 864.00 (804
  cazare + 60 city tax, line items separate) → 4242 → BOOKING CONFIRMED. DB: status
  confirmed, hostaway_reservation_id NEGATIV (mock), 1 processed event, availability
  blocată 14–16. Test user: `checkout-test@avexastays.com` (creat via admin API,
  confirmed). **Gotcha Stripe hosted checkout headless:** radio-ul Card e acoperit de un
  `AccordionButton-expandedClickArea` invizibil — Playwright „not interactable"; fix =
  `elementFromPoint` pe centrul rândului + dispatch secvență PointerEvent; apoi
  `#cardNumber/#cardExpiry/#cardCvc/#billingName` sunt inputuri normale în main frame.
  **P6b rămas:** UN test real Hostaway controlat (scoate mock, date îndepărtate, cancel
  după) + resend-event idempotency check. **P7 = /review multi-agent sweep (queued).**
- **Pending vechi:** rotire `SYNC_SECRET`; SEO fixes din QA (meta desc >155, H1 fără
  "apartments", keyword în primul paragraf).

### 2026-07-01 — Steering framework restructure + OAuth/Resend live
- **Restructured project steering per Anthropic's "steering" article** (commit 72fe47c).
  Instructions now placed by load timing + authority instead of one big CLAUDE.md:
  - **Hooks** (`.claude/settings.json` + `.claude/hooks/*.js`, deterministic, `PreToolUse` exit 2):
    `guard-protected-files.js` blocks Edit/Write to `coming-soon.html` and to `vercel.json` on `main`;
    `pre-commit-checks.js` runs lint+typecheck before a `git commit` that stages app code
    (`.ts/.tsx/.js…` outside `.claude/`) and blocks on failure — docs/config-only commits skip (fast).
  - **Rules** (`.claude/rules/`, path-scoped via `paths:`): `pricing`, `hostaway`, `api-validation`.
  - **Skills** (`.claude/skills/`): `seo-audit` (converted from command), `verify-frontend` (loops
    self-check), `deploy`. **Subagents** (`.claude/agents/`): `code-reviewer` (sonnet),
    `build-log-analyzer` (haiku), `dependency-auditor` (sonnet).
  - **CLAUDE.md 310 → 68 lines** (index only). Full map: `thoughts/steering-framework.md`.
  - Confirmed `.claude/rules/` IS native (frontmatter `paths:` globs; no-`paths` = always-on like CLAUDE.md).
    eslint already ignores `.claude/**` + `thoughts/**`, so tooling scripts never break `npm run lint`.
  - Gotcha: new hooks take effect at next session start, not mid-session — validate scripts directly:
    `echo '{"tool_input":{"file_path":"coming-soon.html"}}' | node .claude/hooks/guard-protected-files.js; echo $?` → `2`.
- **Auth + email live & verified:** Google OAuth configured in Supabase (authorize endpoint 302s to
  Google with the right `client_id` + callback); Resend custom SMTP set, sender `office@avexastays.com`
  (recover endpoint returns 200). Supabase Site URL + Redirect URLs point to the preview while
  `avexastays.com` is coming-soon. Auth code uses `window.location.origin` so it returns to the preview.
- **Stripe:** `pk_test`/`sk_test` added to Vercel (Preview scope) from the client's EXISTING account —
  test mode is fully isolated from their live reservations. `whsec_` deferred until the webhook exists.
  **NEXT: build checkout → Stripe webhook → Hostaway reservation → confirmation email** (Wave 5).
- **Still pending:** rotate `SYNC_SECRET` (was exposed in chat; guards sync/diagnostic endpoints).

### 2026-06-26 — Real Google Maps on /locations (Airbnb-style clustering), browser-verified
- **Replaced the decorative StylizedMap on /locations with a real interactive Google
  Maps JS map** — key-gated, drop-in (same props), graceful fallback to StylizedMap.
  `components/locations/LocationsMap.tsx` + `lib/maps/loadGoogleMaps.ts` (dependency-free
  singleton loader) + `@types/google.maps` (dev). Stay page keeps its Embed map.
- **Coordinates:** real Hostaway lat/lng per suite in `lib/propertyCoordinates.ts`,
  overlaid in `lib/data/properties.ts` (`withCoordinates`) so BOTH the live Supabase
  `content` path and the static fallback get them (Supabase `content` JSON has no coords).
  Sourced from `/api/hostaway/diagnostic` (returns lat/lng+bed/bath/capacity); mapped to
  our ids by address+capacity.
- **Custom price-pin overlays** via `OverlayView` (no Map ID needed → works with just the
  key). **Airbnb clustering:** co-located suites (CV2 ×2, CV142-148 ×4) grouped by
  PROXIMITY (greedy, ~70m) — NOT coordinate-grid rounding, which split 15m-apart suites
  across cell boundaries → one "€X · N" cluster pin; click cluster or zoom ≥16 → fans into
  individual pins.
- **Interactions preserved + verified:** hover card → pin gold (exactly one); click pin →
  scroll list to card (desktop) / popup → property page (mobile); **scroll-sync added**
  (IntersectionObserver, desktop) so the active pin follows the centered card.
- **gm_authFailure fallback:** RefererNotAllowedMapError does NOT trigger `script.onerror`
  (Google paints its own "Oops" box). Hook `window.gm_authFailure` in the loader →
  LocationsMap subscribes → `setFailed` → StylizedMap. Missing referrer now degrades
  gracefully instead of showing Google's error box.
- **Browser verification works in this env** via gstack **/browse** (network + headless
  Chromium BOTH work — the "no network/can't browse" belief from a prior compaction was
  WRONG). Confirmed on the live preview: 64 tiles, clusters, expand, sync, mobile popup.
- **Root blocker was client-side:** the Maps key referrer didn't allow the preview domain.
  Client added `https://*.vercel.app/*` + `https://avexastays.com/*` → works. (Maps JS API
  was already enabled.)
- **Pitfall:** to detect an "active" pin by class, check `scale-[1.2]`, NOT `bg-gold` —
  `PIN_INACTIVE` contains `hover:bg-gold`, so `includes('bg-gold')` matches every pin.
- **Commits:** 3fb3b6e (real map) · 254f74b (gm_authFailure fallback) · bd1a441 (clustering)
  · f593926 (proximity-clustering fix) · plus checklist doc detail (Resend/OAuth + a
  "where each key goes" table; Maps marked done).
- **Pending (client):** rotate `SYNC_SECRET` (exposed in chat). Google OAuth Client
  ID/Secret → Supabase (NOT Vercel env). Resend domain = `avexastays.com`, API key →
  Supabase SMTP.

### 2026-06-19 (later) — Real Supabase email/password auth (committed, multi-agent)
- Orchestrated: 2 parallel Explore recon agents → I built the core → 1 adversarial
  security-review agent → applied required fix.
- **Mirror pattern:** real Supabase Auth is the source of truth (session in httpOnly
  cookies via @supabase/ssr, middleware refresh, RLS). An `AuthProvider` (root layout)
  subscribes to the session and mirrors the user (name/email ONLY, never a token) into
  the existing `avexa_user` localStorage + `avexa:auth-changed` event — so Nav,
  MobileSearchHeader, MyTrips, Profile, sidebar keep working WITHOUT a rewrite.
- Files: `middleware.ts` (session refresh), `components/auth/AuthProvider.tsx`,
  rewritten `LoginForm.tsx` (email/password signup+login toggle, Google via OAuth),
  `app/auth/callback/route.ts` (code exchange), `lib/auth/client.ts` (signOutClient),
  browser client made singleton. Logout in Nav/MobileSearchHeader/Profile → real
  signOut. ProfileApp save persists name (user_metadata) + phone (profiles). Removed
  DemoModeToggle (D-key demo).
- **Security review verdict: safe for MVP.** Fixed the one live issue: **open redirect**
  via unvalidated `?next=` (router.push(next) + callback redirect) → added
  `lib/safeNext.ts` (same-origin path only) used in both. All else PASS (middleware uses
  getUser() not getSession; mirror has no tokens; service-role provably server-only; RLS
  profiles_update_own binds auth.uid()=id; handle_new_user trigger hardened).
- **⚠️ CRITICAL for Wave 5 (booking/payments):** the checkout/profile gates are
  CLIENT-SIDE only (localStorage mirror `loggedIn`) — fine now (no server mutation
  exists), but the future booking/Stripe server action MUST derive identity from
  `getSupabaseServerClient().auth.getUser()` (validated session), NEVER from the client
  `loggedIn`/email/user_id. The localStorage mirror must never gate money.
- **Edge warning (non-blocking):** @supabase/ssr in middleware logs "process.version not
  supported in Edge Runtime" — expected with the canonical pattern; middleware works.
- **GATES for Robert (auth to work live):** Supabase dashboard → Authentication →
  Providers → Email enabled (default on); decide "Confirm email" ON (sends confirmation
  link, user must confirm before login) vs OFF (instant login — easier for testing).
  Google sign-in needs Google provider configured in the same dashboard (the code +
  /auth/callback are ready). Cannot test auth in my sandbox (no network).

### 2026-06-19 — Checkout price fix + Chunk B (date pricing) (committed)
- **Checkout consistency:** BookingSummary showed rack×nights + "Member discount
  −X%" (the struck framing removed from the sidebar). Now book() persists the MEMBER
  subtotal and BookingSummary shows "Stay · N nights" → subtotal + a gold "Member rate
  applied" tag. No rack/struck anywhere.
- **Chunk B — real per-night pricing from `availability`:**
  - `lib/data/availability.ts`: getAvailabilityMap(propertyId, days=180) → reads
    availability (property_id/date/available/price_ron), RON→EUR via
    effectiveEurPerNight, returns `{ 'YYYY-MM-DD': {eur,available,minStay} }`.
    try/catch → `{}` (graceful offline → flat pricing).
  - `lib/date.ts`: shared pure `ymd()` — DO NOT import the server availability
    module into client components (it pulls in getSupabaseAdmin / supabase-js).
    Client components import ONLY `type AvailabilityMap` (erased) + `ymd`.
  - Stay page (`locations/[slug]`) fetches availability, passes to sidebar.
  - StayBookingSidebar: `stayNightPrices` = per-night (availability ?? flat),
    `staySubtotal` = sum drives the total; `isVariablePricing` flips the breakdown
    label ("Stay · N nights" vs "€X × N"). Pricing useMemo no longer computes
    rack/discount.
  - CalendarPopup: optional `priceByDate` → €price under each date, '—' for
    unavailable (disabled), cells h-14 only when prices exist (hasPrices checks
    Object.keys length so an empty map stays compact). Search-pill usage unaffected
    (no priceByDate).
- **MVP caveats:** added rooms keep flat rate (no per-room calendar); a range may
  span an unavailable middle night (endpoints can't be unavailable) — true
  validation is the Wave 4B live price check before payment. Chose real €prices over
  $/$$/$$$ tiers (more useful, on-brand); can add color tiers later.
- **Can't self-verify live** (no network to Supabase): calendar prices + the total
  need Robert's browser with the synced data. Build green = compile-safe; graceful
  fallback = no crash if Supabase unreachable.

### 2026-06-17 (later) — /faq page + clickable phone & WhatsApp (committed)
- Built `/faq` (FAQPage JSON-LD): two groups — "Booking & your stay" (factual
  general Q&As) + "Membership & rates" (reuses exported `faqs` from MemberFAQ).
  Native <details> accordions. Canonical, in sitemap, FAQ link added to footer.
- **Real AVEXA phone (Robert): +40 755 411 059.** Stored as single source of truth
  in `lib/contact.ts` (PHONE_DISPLAY / PHONE_TEL `tel:+40755411059` / WHATSAPP_URL
  `https://wa.me/40755411059` / CONTACT_EMAIL hello@avexastays.com). Footer "Contact
  & Help" now has FAQ, Chat on WhatsApp (wa.me), Call +40 755 411 059 (tel:),
  Contact us, Cancellation policy. New `FooterLink` renders tel:/mailto:/http as <a>
  (http → new tab), internal via <Link>.
- Replaced the old PLACEHOLDER +40 712 345 678 in components/trips/ContactSection.tsx
  with the real number via the shared constants. If the number ever changes, edit
  lib/contact.ts only.

### 2026-06-17 (later) — /guide Bucharest city guide built (committed, verified live)
- Built `/guide` (was deferred). Real original Bucharest content: neighbourhoods,
  what to see, eat & drink, getting around, day trips, when to visit, Good-to-know
  tips, CTA → /locations. Brand voice, links to /locations. ~1000 words, accurate.
- **Zoom-stable hero (Robert's spec):** hero height in viewport units (`h-[82svh]`)
  + next/image `object-cover`. Because the viewport's apparent size is constant
  under browser zoom, the hero image keeps its on-screen size when zooming; only
  rem/clamp TEXT scales. This is the technique for "image fixed, text changes on
  zoom" — viewport-unit sizing, NOT background-attachment:fixed (breaks on iOS).
  Hero image: /listing-photos/20-palace-view.jpeg.
- SEO: keyword title/desc, canonical, OG, Article + BreadcrumbList JSON-LD, in
  sitemap, /guide link restored in footer Discover.
- **Footer dead links now:** only /help, /accessibility, /careers, /press, /partners
  remain removed (about + long-stays still not built; guide now IS built).

### 2026-06-17 (later) — Legal pages + FAQPage + footer dead-link cleanup (committed)
- **FAQPage** on /member-benefits: schema built from the `faqs[]` array now EXPORTED
  from MemberFAQ.tsx (import the data, don't duplicate → schema always matches text).
- **4 legal pages built** with PRIME GOLD LIVING SRL data (Robert provided):
  /imprint, /privacy (GDPR), /terms, /cancellation. Company: PRIME GOLD LIVING SRL,
  CUI 52265361, Reg.Com J2025057993006, EUID ROONRC.J2025057993006, founded 2025-08-01,
  Str. Fibrei 28, Sector 2, 020342 Bucharest. Shared `components/legal/LegalShell.tsx`
  (scoped typography via `[&_h2]:` arbitrary variants — NO global CSS). English to match
  site. Cancellation aligned to member FAQ (free until arrival day, 1-night on arrival
  date) + Saver(non-refundable)/Flex split. **Boilerplate — Robert should have counsel
  review before launch** (told him; no "draft" disclaimer on the live pages).
  Indexable, canonical'd, added to sitemap; removed noindex /login from sitemap.
- **Footer dead links removed** (Robert: "exclude le pe acestea"): help, accessibility,
  guide, long-stays, about, careers, press, partners all 404'd → removed. Empty "AVEXA"
  column dropped (grid 4→3). Discover gained /member-benefits (real page, internal link).
  These 8 pages are now DEFERRED — /guide is the biggest SEO long-tail opportunity but
  needs real original Bucharest content (dedicated session); /about + /long-stays can be
  assembled from existing data when wanted.

### 2026-06-17 (later) — Structured-data sweep (committed)
- **Goal (Robert):** make existing pages readable by Google + LLMs via structured
  data, ZERO text/layout change. Two commits:
  - `/locations` overview: JSON-LD `ItemList` (8 suites: name, /locations/[slug]
    url, image, address+neighborhood, EUR offer) + `BreadcrumbList`. Server-rendered.
  - Homepage: `Organization` (name, url, logo→/opengraph-image, Bucharest address,
    socials in sameAs: IG/TikTok/FB/LinkedIn) + `WebSite` (publisher→org @id).
- **logo stand-in:** no logo file in /public (logos kit not added yet) → Organization
  logo points to the OG PNG route `/opengraph-image`. Swap to a dedicated SQUARE
  logo PNG when /public/logos is populated (1-line change). Google prefers raster;
  do NOT point logo at an SVG.
- **No SearchAction** in WebSite: there's no text-search endpoint (the search pill is
  dates/guests, not /search?q=). Declaring a fake SearchAction is invalid — add the
  sitelinks searchbox only once a real text-search results page exists.
- **Now ALL page types have structured data:** homepage (Org+WebSite), /locations
  (ItemList+Breadcrumb), /locations/[slug] (LodgingBusiness+Breadcrumb). Verify with
  Rich Results Test / validator.schema.org (JSON-LD is in a <script>, so WebFetch's
  markdown can't see it — build-green is the proof it emits).

### 2026-06-17 (later) — Route move: /stays/[id] → /locations/[slug] (committed)
- **Decision (Robert):** property detail pages now live UNDER /locations as
  /locations/[slug] (e.g. /locations/the-modern-green-gem) instead of
  /stays/the-modern-green-gem. Reason: /locations is the hub; jumping to /stays/*
  broke the URL hierarchy. Done PRE-LAUNCH (root still serves coming-soon, nothing
  indexed) → zero migration cost, ideal timing. This resolves the long-open
  "route naming" decision in PLAN.md.
- **Scope was ROUTES ONLY — zero visible text changed** (Robert was explicit twice).
  Did NOT build neighbourhood landing pages and did NOT write any new copy; the
  earlier "/locations/[slug] neighbourhood pages + 800 words" idea is dropped.
- **What changed:**
  - Moved app/(marketing)/stays/[id]/page.tsx → app/(marketing)/locations/[slug]/page.tsx
    (param renamed id→slug; still accepts BOTH numeric id and slug, canonical→slug).
  - 5 internal links repointed /stays/→/locations/: PropertyCard, LocationsView
    (mobile popup), MosaicSection, TripsList (/locations/101), + the page's own
    "More AVEXA suites" links.
  - SEO sync: canonical, sitemap.ts, JSON-LD (LodgingBusiness + BreadcrumbList) urls,
    OG url → all /locations/[slug].
  - next.config.ts: `async redirects()` 301 `/stays/:slug → /locations/:slug` (safety
    net for any old/bookmarked link; nothing indexed yet so not SEO-critical).
- **GOTCHA:** after moving/removing a route folder, `tsc --noEmit` failed on STALE
  `.next/types/app/(marketing)/stays/...` validator files (TS2307). Fix: `rm -rf .next`
  then rebuild — regenerates clean route types. Remember this for any future route move.
- **Untouched:** /locations overview (still hub), /long-stays (separate route),
  checkout/booking flow (uses propertyId from localStorage, not URL), all page text.

### 2026-06-17 — Wave 4A-trimmed: SEO + launch hardening (committed)
- **Scope cut per Robert:** no Twitter account → removed twitter card from root
  layout entirely. No GA4/PostHog accounts yet → analytics + cookie consent
  DEFERRED (drop-in when accounts exist). No Stripe test keys → Wave 4B (payments)
  stays BLOCKED.
- **Shipped (build green, 29 static pages):**
  - Homepage metadata: keyword-first `title.absolute` = "Bucharest City Center
    Apartments | AVEXA Stays" + keyword meta description + `canonical: '/'` +
    OG override. (Was inheriting root default "Live the city.")
  - Canonicals added: `/locations`, `/member-benefits`, `/stays/[id]` (→ slug URL,
    the id form is the duplicate). Stay page also got OG (cover image).
  - `noindex` (robots index:false, follow:false) on member/auth pages:
    my-trips, profile, checkout, login.
  - `app/opengraph-image.tsx`: dynamic 1200×630 via next/og ImageResponse —
    ink bg + gold AVEXA wordmark + keyword subtitle. **No external font fetch**
    (Satori default font) so it builds offline-safe. Route `/opengraph-image`.
  - `app/not-found.tsx` (branded 404) + `app/error.tsx` (client error boundary,
    console.error → real monitoring later). Both ink/gold, avoid apostrophes
    (eslint react/no-unescaped-entities is ON — use no-contraction copy or &apos;).
  - `next.config.ts` security headers via `async headers()`: HSTS, nosniff,
    X-Frame SAMEORIGIN, Referrer-Policy, Permissions-Policy.
- **CSP intentionally deferred** — needs full 3rd-party origin set (Maps/Stripe/
  Supabase/analytics) + nonce middleware for Next inline hydration. Build it at
  launch hardening, not before (would just be rewritten). Noted inline in config.
- **H1 left as-is:** "Bucharest City Center, *unlocked*" (lowercase italic gold +
  pulse-dot for the period) is a deliberate brand choice and already contains the
  "Bucharest City Center" keyword (SEO rule #8 satisfied). Did NOT jam "apartments"
  into the hero — that is a brand call.
- **Deferred-but-easy when accounts land:** GA4 + PostHog(EU) + consent banner;
  Twitter card (only if they ever make an account); CSP.
- **NEXT no-gate option:** Wave 5 `/locations/[slug]` detail pages (800+ words +
  Google Maps embed — Maps key already exists). Auth (Wave 2) is partially gated
  (email works; Google OAuth needs Supabase dashboard config). Chunk B still parked.

### 2026-06-16 (later) — Chunk A polish + Chunk C multi-room — UNCOMMITTED (classifier outage)
- **On disk, vetted, lint+typecheck clean — NOT yet committed/pushed** (the command
  safety classifier tied to opus-4-8 went temporarily unavailable → couldn't run
  build/git, even with sandbox disabled).
- Done this batch: (1) price+/night alignment fixed in StayBookingSidebar
  (`justify-between`→`gap-1.5`, "/ night"→"/night"); (2) `lib/roomGroups.ts` added
  (getSiblingIds); (3) **Chunk C multi-room "Add room"** — StayBookingSidebar takes
  `siblings` prop, add/remove sibling rooms, combined order total in gold, "Book N
  rooms"; page.tsx computes+passes siblings; types Booking gains `addedRoomIds?`.
  I read the full sidebar code — clean, no bugs (city tax uses same occupants/room =
  MVP simplification; added rooms always saver rate — fine for now).
- **WHEN CLASSIFIER RECOVERS:** `npm run lint && npm run typecheck && npm run build`,
  then ONE commit (alignment + roomGroups + multi-room) + push, then WebFetch the stay
  preview to verify: add-room renders, "€X /night" sits together, prices gold, total
  combines. Uncommitted files: components/stay/StayBookingSidebar.tsx, lib/roomGroups.ts,
  app/(marketing)/stays/[id]/page.tsx, types/index.ts, LEARNINGS.md.
- **Chunk B still pending** (date pricing from availability + calendar/book-now sticky).

### 2026-06-16 (later) — Mobile non-issue + booking price polish (Chunk A)
- **Mobile "broken" was a STALE deployment** — Robert was testing avexa-stays-3hkykgzxb
  (old). On the latest branch preview it's fine. Still shipped real improvements:
  `main` pb now `calc(5rem+env(safe-area-inset-bottom))` (clears TabBar on notched
  iPhones); `100vh`→`100dvh` (LocationsView, ProfileApp, StylizedMap, StayBookingSidebar).
  Mobile UX (scroll-chrome) confirmed working on latest. (commit 58d3df4)
- **Chunk A done (commit 32e19e3):** StayBookingSidebar — removed the struck-through rack
  price (only struck price in production TSX; rest was legacy stay-sidebar.jsx). Member
  nightly + total now `text-gold-dark`. Breakdown = single member×nights line (no
  rack/discount lines). "Member Benefits" badge + "15% off" perk text KEPT (Robert: photo-3
  style, no struck number). Verify on Vercel after rebuild.
- **OPEN — booking→checkout still rack-based:** `book()` still writes pricePerNight=
  rackPerNight + discount to the Booking/localStorage → checkout (BookingSummary) still
  shows rack+discount. Align to member values when reworking checkout (Wave 4 / demo flow).
- **NEXT — Chunk B (date pricing + calendar):** when dates selected, show per-day prices
  from the `availability` table (price_ron/date already synced, 180d) + total; "Book now"
  opens a 2-month calendar (availability + price tiers $/$$/$$$ like Robert's photo 2),
  sticky on locations. "from €X" (min) when no dates = already correct.
- **NEXT — Chunk C (multi-room "add room"):** Robert grouped by NEIGHBORHOOD (not strict
  building): Old City Center = 101 + 201; Calea Victoriei = 202 + 301 + 302 + 303 + 201
  (201 Golden Forest appears in BOTH — reconcile: it's CV2, edge of Old Town + on Calea
  Victoriei); Universitate = 203; Piața Romană = 304. On a stay page: "Add room" + sibling
  suites in the same group with "+", price for selected period + total. Verify current
  neighborhood field values vs this grouping before building.

### 2026-06-16 (later) — Wave 3 chunk-2: locations real prices + Vercel self-verify
- LocationsView refactored to receive `properties` as a prop (was importing static
  lib/properties). `locations/page.tsx` → async, getAllPropertiesData(), ISR 900.
  PropertyCard / StylizedMap / mobile popup now show real EUR (all prop-driven).
- Only other static importer = MosaicSection (trips page, photos only, no price → left).
- **Vercel self-verify works:** MCP deployment-list is cross-scope (403 for berti8), BUT
  the branch preview pages are PUBLIC → WebFetch reads real rendered data. Verified
  stays 101 €37/rack €44, 201 €57/rack €67, footer prices all correct. After each push
  I can WebFetch the preview to verify rendered pages myself (guarded API routes still
  need the bearer / Robert). Preview: avexa-stays-git-feat-nextjs-platform-berti8.vercel.app
- **Open (product):** "from" price = cheapest available night over 180d (€37 for 101).
  Robert to confirm if that basis is right or wants typical/base price.

### 2026-06-16 (later) — Pricing switched to FIXED FX rate 5.2 (Robert)
- Replaced dynamic BNR with **fixed `AVEXA_FX_RATE` (default 5.2)**.
  `effectiveEurPerNight(ron)` no longer takes a rate — reads env. Kept markup 18% +
  FX margin 3% (Robert can make 5.2 all-in by setting `AVEXA_FX_MARGIN_PERCENT=0`).
- Pricing is now fully deterministic/offline (no rate read in render). `getCachedEurRate`
  is now unused; `/api/cron/fx` + `exchange_rates` kept ONLY to monitor real BNR vs 5.2.
  **fx cron run is no longer needed for pricing.**
- From-prices (5.2 / 18% / 3%): 101 €37, 203 €45, 302 €48, 202 €53, 303 €53,
  201 €57, 301 €57, 304 €53.

### 2026-06-16 (later) — Wave 3 chunk-1: real EUR prices on stay pages
- **Shipped (build green, /stays/[id] = SSG + ISR 15m):**
  - `lib/pricing.ts`: effectiveEurPerNight(ron,bnr)=ceil(ron×(1+markup)/bnr×(1+fx)),
    rackEurPerNight=round(eff/0.85). markup/fx from env (18/3 default).
  - `lib/fx.ts`: NEW `getCachedEurRate()` reads ONLY Supabase exchange_rates (no live
    BNR fetch in render). `getCurrentEurRate` removed. `fetchBnrEurRate` stays (cron only).
    FALLBACK_EUR_RON=5.06.
  - `lib/data/properties.ts`: getAllPropertiesData / getPropertyData read Supabase
    (content JSONB + price_from_ron) → applyLivePricing sets rates[0].perNight =
    effective EUR. Graceful fallback to static lib/properties on ANY error (offline
    builds + outages don't break). getAllPropertySlugIds (static) for generateStaticParams.
  - `app/(marketing)/stays/[id]/page.tsx`: async, reads data layer, `revalidate=900`.
    Booking sidebar + other-suites footer now show real EUR (101 ≈ from €38, rack €45).
- **LESSON:** never `fetch(..., {cache:'no-store'})` in an ISR/static render path — it
  throws Next "dynamic server usage". Read cached data (Supabase) in render; do live
  external fetches only in route handlers/crons.
- **Robert TODO:** run `/api/cron/fx` once (Bearer CRON_SECRET) to populate the real BNR
  rate — until then prices use FALLBACK 5.06 (close, not exact). Then stay pages show
  exact EUR. Dev: `npm run dev` → open /stays/the-little-gem → sidebar shows real price.
- **Next (chunk-2):** locations page shows real prices — refactor LocationsView (client,
  imports static `properties` + getPropertiesByNeighborhood + getProperty) to receive
  live-priced properties as a prop from the server page. PropertyCard/StylizedMap then
  show real prices automatically. Homepage carousel shows no price (skip).

### 2026-06-16 (later) — Wave 1 COMPLETE & validated end-to-end ✅
- **Ran in Robert's terminal, all green:** migration 002 applied; seed → 8 properties
  in Supabase with correct hostaway_listing_id; diagnostic + sync → 181 days/property
  of availability + price_from_ron.
- **Calendar shape CONFIRMED** (parser was correct, no change): day = { date,
  isAvailable (0/1), status ('available'/'reserved'), price (RON, per-night DYNAMIC),
  minimumStay, maximumStay, countAvailableUnits, ... }.
- **price_from_ron (cheapest available night / 180d):** 101=155, 201=240, 202=225,
  203=190, 301=240, 302=205, 303=225, 304=225.
- **Notes:** Hostaway calendar has dynamic pricing (use per-night calendar price, not
  listing base). All 8 cancellationPolicy='flexible' in Hostaway (our Saver/non-refundable
  rate is OUR construct — Wave 3). lat/lng captured per listing (for maps).
- **Next:** Wave 2 (Supabase Auth — needs Google OAuth configured in Supabase dashboard
  first) OR Wave 3 (pricing pipeline lib/pricing.ts + rewire stays/locations pages to
  read price/availability from Supabase, show real EUR). Page rewire caveat: pages that
  fetch at build need network; add graceful fallback to lib/properties.ts so offline
  builds don't break. Run `/api/cron/fx` (Bearer CRON_SECRET) once to populate the BNR
  rate before pricing display.

### 2026-06-16 (later) — 8-way mapping resolved; Wave 1b shipped (seed + sync)
- **Mapping CONFIRMED** via owner's Drive folder names (building codes D2/C5/C7/B35)
  cross-checked with Hostaway internal listing names. In `lib/hostaway/mapping.ts`:
  101→473889, 201→473898, 202→473904, 203→502511, 301→473896,
  302→473895 (D2 Sapphire), 303→499679 (C7 Oak), 304→473905.
  9th unit Suite 102 (CV142-B34) is IN RENOVATION → excluded. Drive calls 301
  "Amber Gem" vs site "Ultracentral Gem & Palace View" (site name = source of truth).
- **Wave 1b code (build green, NOT yet run against DB — needs Robert):**
  - `POST /api/admin/seed` (SYNC_SECRET): upserts the 8 properties from
    lib/properties.ts into Supabase (full editorial content as JSONB +
    hostaway_listing_id). Idempotent.
  - `GET /api/sync/hostaway` (SYNC_SECRET or CRON_SECRET): 1 listings call + per-
    property calendar (180 days) → upserts `availability` (available, price_ron,
    min_stay) + updates price_from_ron, bedrooms, bathrooms, last_synced_at.
- **⚠️ UNCONFIRMED: Hostaway calendar field shape.** Sync parses defensively
  (`isAvailable===1 || status==='available'`, `price`, `minimumStay`) but I could
  NOT verify field names (no network). Robert must run /api/hostaway/diagnostic and
  paste `calendarSample`; adjust the parser in sync route if names differ.
- **Robert's run order:** (1) apply `db/migrations/002_hostaway.sql` in Supabase SQL
  Editor, (2) `npm run dev`, (3) POST /api/admin/seed, (4) GET /api/hostaway/diagnostic
  (paste calendarSample), (5) GET /api/sync/hostaway (paste summary).
- **Next (chunk 1c):** rewire stays/locations pages to read price/availability from
  Supabase (keep editorial content; ISR 15 min). Pages still read lib/properties.ts today.

### 2026-06-16 — Setup VALIDATED live; starting Wave 1
- **All green (validated from Robert's terminal — my sandbox has no network):**
  - Migration IS applied (anon read on `properties` → 200 empty). Wave 0 live in DB.
  - service_role key works (read `bookings` OK). Supabase fully wired.
  - Hostaway auth OK: token len 678, **expires_in 63158400s ≈ 24 months** (matches docs);
    `GET /v1/listings` → **count 8** (our 8 suites). First: id 473889 "Little Heaven 1R |
    Calea Victoriei | Old Town", **price 260 currency RON** (confirms RON→EUR pipeline).
- **Hostaway listing field shape (for the adapter):** id, propertyTypeId, name,
  externalListingName, internalListingName, description, thumbnailUrl, houseRules,
  keyPickup, specialInstruction, doorSecurityCode, country, countryCode, state, city,
  street, address, publicAddress, zipcode, price, starRating, weeklyDiscount,
  monthlyDiscount, propertyRentTax, guestPerPersonPerNightTax, guestStayTax,
  guestNightlyTax, refundableDamageDeposit, isDepositStayCollected, personCapacity,
  maxChildrenAllowed, maxInfantsAllowed, maxPetsAllowed, lat, lng, checkInTimeStart,
  checkInTimeEnd, checkOutTime, cancellationPolicy, squareMeters, roomType,
  bathroomType, bedroomsNumber, bedsNumber, bathroomsNumber. (Amenities/photos come
  from separate listing sub-resources — verify endpoints during Wave 1.)
  → `doorSecurityCode` exists at listing level (relevant to §10.5 pre-arrival PIN, but
  likely want per-reservation code — verify Wave 5). `cancellationPolicy` informs rate plans.
- **GOTCHA — Vercel "Sensitive" env vars are write-only:** `vercel env pull` returns
  them EMPTY. SUPABASE_SERVICE_ROLE_KEY + HOSTAWAY_API_KEY were marked Sensitive, so the
  pull gave `""`. Fix: paste secret values directly into `.env.local` once (Vercel still
  has them for deploys). Non-sensitive vars pull fine.
- **SECURITY TODO:** Robert pasted the Hostaway client secret in chat → rotate it in
  Hostaway, update `.env.local` + Vercel. Code is value-agnostic (reads from env).
- **My-sandbox limitation:** the Bash/PowerShell tool has NO network (even sandbox-off
  background tasks hang). Any live API check must run in Robert's terminal. Build/lint/
  typecheck work fine locally (no network needed).

### 2026-06-12 (env + model) — Vercel link fixed; Fable→Opus rename
- **Model context:** Fable 5 suspended for this user (US export-control directive,
  2026-06-12, foreign national). Orchestrator is now **Opus 4.8**. efficient-fable
  convention unchanged (model-agnostic); docs scrubbed of "Fable as the build model"
  (skill name kept).
- **Pricing pipeline LOCKED (spec §3.1):** Hostaway base RON × (1 + AVEXA_MARKUP_PERCENT,
  default 18) = effective RON; ÷ BNR × (1 + AVEXA_FX_MARGIN_PERCENT, default 3), ceil to
  whole EUR/night = effective EUR = CHARGED amount = the "member rate". Member 15% is
  PRESENTATION only: rack = effective ÷ 0.85, struck-through. NEVER subtract 15% twice.
  Markup in ONE place (env var), never per-listing, never inline. CONFIRMED 2026-06-16:
  18% business margin + 3% FX margin are SEPARATE and STACK intentionally (~+21.5%).
- **Hostaway auth confirmed:** POST /v1/accessTokens (client_credentials,
  client_id=HOSTAWAY_ACCOUNT_ID, client_secret=HOSTAWAY_API_KEY, scope=general); token
  valid **24 months** → store in Supabase, wait 1s after issuing, 403 → refresh once;
  limits 15 req/10s per IP, 20 req/10s per account → cache hard. Feeds Wave 1.
- **Vercel env fix:** `vercel link` had run in `C:\Users\berti` (home), creating the
  pulled `.env.local` there + linking the home dir. Fixed: linked the PROJECT dir
  (copied `.vercel`), merged the pulled values into the project `.env.local`, removed
  the stray home `.env.local`/`.vercel`. Still MISSING (Robert must add to Vercel
  + they'll flow to local): SUPABASE_SERVICE_ROLE_KEY, HOSTAWAY_API_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, CRON_SECRET. Add for ALL environments.
- **Next:** once those 4 land, `go wave 1` (Hostaway client + sync + adapter).

### 2026-06-12 (later) — Spec APPROVED ("ok go"); Wave 0 shipped
- **Done (Wave 0 — Foundations):** `db/migrations/001_init.sql` (9 tables, RLS,
  triggers incl. auto-profile on signup) + `db/README.md`;
  `types/database.types.ts` (hand-written, regen via `npm run db:types` once CLI
  linked); `lib/supabase/{client,server,admin}.ts` (@supabase/ssr installed;
  admin = lazy, server-only); `lib/fx.ts` (BNR XML parse, +3% margin,
  per-night ceil to whole EUR, 4-day staleness fallback);
  `/api/cron/fx` route (Bearer CRON_SECRET); `.env.example` cleaned
  (NEXTAUTH removed); build green (28 pages).
- **NOT done / needs Robert:** `.env.local` doesn't exist yet — no Supabase
  keys locally, so migration NOT applied to the real project. Robert must:
  (1) create `.env.local` from `.env.example` + add the same vars in Vercel,
  (2) run `db/migrations/001_init.sql` in Supabase SQL Editor (or link CLI).
- **Next (Wave 1):** Hostaway client + sync route + cron + adapter
  Hostaway→`Property`; stays/locations read from Supabase (ISR 15 min).
  Wave 1 can START without keys (client code + adapter), but end-to-end sync
  test needs HOSTAWAY_* and Supabase keys in `.env.local`.
- **Conventions set in Wave 0:** prices stored RON; `rate_plan` neutral values
  `non_refundable`/`flexible` (marketing names in UI only, naming pending §10);
  `order_id` groups multi-room; vercel.json crons deferred to Wave 7.

### 2026-06-12 — Docs trued up; Phase 5 interview next
- **Done:** Full audit of docs vs code (5 parallel agents + direct verification).
  PLAN.md rewritten to reality (UI Phases 1–4 = demo mode, zero integrations;
  Phase 5 = production build). BRAND.md token sections corrected from
  `globals.css`/`fonts.ts`/`Icon.tsx` (body is Manrope 400 not 300, mono labels
  10px not 11px, `--font-dm-mono` var, `--color-nbh-*` tokens, no `--white`,
  `/public/logos/` doesn't exist, icon-in-tile sizing issue documented).
  CLAUDE.md commands fixed (npm, real scripts). This file populated.
- **Done (later same day):** Phase 5 interview completed (3 rounds). Spec written:
  `/thoughts/plans/2026-06-12-phase-5-production-booking-platform.md` —
  **AWAITING ROBERT'S APPROVAL, no build before sign-off.**
  Key decisions: Stripe deferred (no access yet → PaymentProvider stub, Wave 5);
  RON→EUR at BNR daily +3%, round up to whole EUR; account required to book;
  member −15% vs OTA (provisional); 2 rate plans renamed (NOT Saver/Flex — NUMA
  uses those; shortlist in spec §10); multi-room = sibling suites section +
  add-another-room, one payment → N Hostaway reservations; /stays/[slug] kept +
  /locations/[slug] new; reviews sync from Hostaway; video-ready hero slot.
- **Next:** Robert approves/edits spec → start Wave 0 (Supabase schema + fx engine).
- **Open threads:** spec §10 list (rate naming, building mapping, services list,
  member mechanics, door PIN source, GA4/PostHog IDs, Stripe timing); Robert adds
  env vars to Vercel (list delivered in chat + spec §7).
- **Constraints to respect:** never touch `coming-soon.html` / `vercel.json` on
  main; work in waves (commit clean + resume note before every possible pause);
  efficient-fable delegation for token-heavy work.

---

## Patterns That Work Well

- **`<Reveal />` wrapper for scroll animations** — one component, 4 directions,
  canonical 0.9s + `cubic-bezier(0.16,1,0.3,1)`, `once: true`. Reused across
  13+ sections. Add variants there, not per-component.
- **Typed `Icon` wrapper over lucide-react** (`components/Icon.tsx`) — single
  import point, typed names, consistent defaults (size 20 / stroke 1.6).
- **3-field search pill kept on mobile** with bottom-sheet expansion (Airbnb
  pattern) — discoverability beats minimalism (single-button version was
  reverted, commit d7550d5).
- **Keeping the `Property` type stable** while data is hardcoded — Phase 5 can
  swap `lib/properties.ts` for a Hostaway→Supabase adapter without UI changes.
- **Efficient-fable fan-out** — 5 parallel cheap agents inventoried the entire
  repo+docs+history (~430k subagent tokens) while the orchestrator (Opus 4.8) kept judgment/synthesis.

## Patterns to Avoid

- **Never wrap `createPortal` children in `AnimatePresence`** — the portal
  escapes the React tree and presence detection breaks (fix e1c85dd).
- **Portal-rendered dropdowns don't inherit colors** from trigger context — set
  explicit text/bg on the panel (fix a5906ab).
- **Don't collapse the search pill to one button on mobile** — kills
  discoverability (revert d7550d5).
- **Don't build display letterforms from custom SVG/skew transforms** — browser
  font rendering is more reliable; the coming-soon "X" burned 16 commits
  (revert 3a5eb34).
- **Gradient-only hero feels flat** — layer a faded photo under the gradient
  (bc7fba7).

## Recurring Mistakes (Don't Repeat)

- **Docs drifting from code** — PLAN/BRAND claimed things code contradicted
  (fonts weights, phases, env names). After every shipped phase, true up docs
  (or run /document-release).
- **Package-manager ambiguity** — repo is **npm** (`package-lock.json`
  tracked). Running `corepack pnpm` once hijacked `node_modules` and created
  stray pnpm lockfiles; required full clean reinstall. Don't "follow the docs"
  into pnpm.
- **Script naming** — it's `npm run typecheck` (renamed from `type-check`
  2026-06-12 to match docs).

---

## Useful Code Snippets

### Quality gate before every commit
```bash
npm run lint && npm run typecheck    # add: npm run lint -- --fix to auto-fix
```

### Generate secrets
```bash
openssl rand -base64 32
```

### Planned (Phase 5 — scripts don't exist yet)
```bash
# pnpm-era docs mentioned db:types / db:migrate / test — NOT implemented.
# Add as npm scripts when Supabase lands.
```

---

## Build/Deploy Issues

- **`next lint` is deprecated (removed in Next 16)** — we use ESLint CLI flat
  config (`eslint.config.mjs`, FlatCompat + next/core-web-vitals +
  next/typescript). Legacy root prototypes are in `ignores`.
- **npm audit shows 2 moderate vulns (postcss <8.5.10, GHSA-qx2v-qp2m-jg93)** —
  it's Next's own pinned nested copy; no fix without `--force` downgrade to
  next@9 (absurd). Low real risk (only our own CSS is processed). Ignore until
  Next bumps it.
- **`vercel.json` legacy rewrites break Next.js App Router routes** — on the
  feature branch it must stay `{"framework":"nextjs"}` only (fix 5035f7d).
  `main` keeps the coming-soon rewrite until launch.
- **Never name a static landing page `index.html`** alongside Vercel rewrites —
  clashes with default routing (fix 7dd0a1f).

## Mobile/UI Learnings

- **iOS Safari input zoom:** lock viewport (`maximumScale: 1, userScalable:
  false`) AND force `font-size: 16px` on all text controls under 640px
  (globals.css @media block) — both are needed (fix 19b59e3).
- **`touch-action: manipulation`** on all interactive elements kills the 300ms
  double-tap delay (globals.css).
- **Map popups in CSS maps:** `overflow:hidden` on the parent does NOT hide
  absolutely-positioned children — reset visibility/z-index explicitly on close
  (fixes 72afa14, d8aca08).
- **Icon-in-tile optics:** lucide glyphs have built-in padding in the 24px
  viewBox; at stroke 1.6, size 16–20 inside a 40–48px tile the glyph reads
  small. Fix globally in Phase 5 polish (documented in BRAND.md → Icons).

## SEO Discoveries

- JSON-LD ships only on `/stays/[id]` (LodgingBusiness + BreadcrumbList).
  Homepage/locations/member pages have no schemas yet.
- No canonicals, no OG image, no GA4/PostHog, no security headers yet — full
  gap list in PLAN.md → "Remaining Phase-1 gaps".

---

## Decisions That Required Backtracking

- Single search button on mobile → reverted to 3-field pill (d7550d5).
- Custom SVG "X" letterform on coming-soon → reverted to plain font (3a5eb34).
- Gradient-only hero → added photographic backdrop (bc7fba7).
- `avexa-design-system.html` (Cormorant Garamond + #C9A84C gold, "dark luxury")
  → discarded direction; production system is Jakarta/Manrope/DM Mono +
  #DDB97A. Don't resurrect tokens from that file.

---

## Hostaway API Quirks

(Empty — populate during Phase 5 integration.)

## Stripe Integration Notes

(Empty — populate during Phase 5 integration.)

## Performance Insights

(Empty — populate during Phase 4-style audit after Phase 5.)

## User Feedback Patterns

(Empty — populate after launch.)
