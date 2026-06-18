# AVEXA — Session Learnings

> Self-improving knowledge base. Read at the start of every session,
> update at the end. Captures patterns, mistakes, and useful snippets.
> Populated 2026-06-12 from full git-history + code audit.

---

## ⏯ Session Resume Notes (newest first)

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
