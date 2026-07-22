# AVEXA STAYS — Implementation Plan

> Last updated: 2026-06-12 (full audit against code — docs previously lagged reality)
> Current phase: **Phase 5 — Production Booking Platform** (spec in progress, see `/thoughts/plans/`)
>
> **Branch state:** `feat/nextjs-platform` is ~26 commits ahead of `main`.
> `main` still serves `coming-soon.html` on the root domain (do not touch until launch).
> Vercel previews of the feature branch run the full Next.js app.
>
> **Reality note:** the entire UI (Phases 1–4 surface) shipped in **demo mode** —
> data hardcoded in `lib/properties.ts` (8 properties), auth is localStorage-only,
> payment is mocked, there are **zero API routes and zero integrations** (no
> Supabase/Stripe/Hostaway/Maps/Brevo code). Phase 5 makes it real.

---

## SEO Strategy

**Primary keyword:** "Bucharest city center apartments"

**Goals:**
- Rank top 3 on Google for primary keyword within 6 months of launch
- Lighthouse 95+ on all marketing pages
- Core Web Vitals "Good" (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Mobile-first, all pages crawlable
- 100% pages with unique meta + canonical + structured data

**Secondary keywords:**
- Short term rental Bucharest
- Premium apartments Bucharest
- Bucharest accommodation digital check-in
- Apartments Calea Victoriei
- Bucharest no front desk hotel

**Long-tail (per location page):**
- Apartments near Calea Victoriei
- Where to stay Old Town Bucharest
- Universitate Bucharest accommodation
- Piața Romană apartments

---

## Completed ✅

### Pre-platform (April–May 2026)
- [x] Brand identity finalized (Gold Editorial V4)
- [x] Static HTML prototypes for all pages (now legacy, repo root)
- [x] Coming soon page live on avexastays.com (root rewrite on `main`)
- [x] DNS propagated, Google Workspace configured (MX + DKIM)
- [x] Logo export kit (30+ PNG variants — outside repo; `/public/logos/` not yet populated)
- [x] Final copywriting written (in BRAND.md)
- [x] Google Maps API created + restricted + $50 budget alert
- [x] Supabase organization created (client = Owner)
- [x] Vercel project deployed (avexa-stays)
- [x] CLAUDE.md, PLAN.md, ARCHITECTURE.md, BRAND.md, INTEGRATIONS.md created

### Next.js platform — UI layer (June 6–10, 2026, `feat/nextjs-platform`)
- [x] Next.js 15 App Router scaffold (TypeScript strict, Tailwind v4, Motion)
- [x] Homepage: hero (gradient + photo backdrop), editorial scroll story (400vh pinned, stacked on mobile), locations carousel, how-it-works panels, benefits, footer with AVEXA watermark
- [x] `/locations`: 8 suites / 4 zones, stylized CSS map (NOT Google Maps), card↔pin interaction, mobile List/Map toggle with price-pin popups
- [x] `/stays/[id]`: gallery + lightbox, amenities modal (Property/Room tabs), booking sidebar (rates, upgrades, price breakdown), FAQs, JSON-LD (LodgingBusiness + BreadcrumbList)
- [x] `/member-benefits`: hero, statement, 6 perks, loyalty reward (3 trips → +10%), compare table, FAQ, CTA
- [x] Checkout: 3-step demo flow (contact → mocked payment → confirmation), auth gate
- [x] Auth UI: login page (email + Google/Apple buttons), demo mode via localStorage (D-key toggle)
- [x] Member area: `/my-trips` (logged-out / empty / with-trips states, mosaic, contact), `/profile` (details edit, preference toggles)
- [x] Mobile overhaul: bottom sheets, full-screen search overlay (Airbnb-style), sticky search header, tab bar, scroll-aware chrome, iOS zoom lock
- [x] SEO foundation: `sitemap.ts`, `robots.ts`, per-page metadata, JSON-LD on stays
- [x] Search system: dual synced pills (hero + sticky), calendar + guest popups, SearchContext

### Tooling (June 11–12, 2026)
- [x] Project context docs committed; efficient-fable orchestration convention adopted
- [x] ESLint migrated to flat config CLI (next lint deprecated); `typecheck` script aligned
- [x] npm standardized as package manager (package-lock.json is source of truth)
- [x] Docs trued up to audited code reality (PLAN, BRAND, LEARNINGS, CLAUDE)

---

## In Progress 🔄

- [ ] **Phase 5 build spec** — interview + spec doc in `/thoughts/plans/`, awaiting Robert's approval. NO build work before approval.
- [x] API keys gathered (Google Maps, Stripe live, Hostaway, Supabase) — to be added to Vercel during Phase 5 setup

---

## Phase 1 — Foundation + SEO Core — ✅ LARGELY DONE (audited 2026-06-12)

Shipped: scaffold, fonts via `next/font` (Jakarta/Manrope/DM Mono), `sitemap.ts`,
`robots.ts`, `components/seo/JsonLd.tsx`, all marketing pages, mobile-first
responsive, image optimization via `next/image`.

### Remaining Phase-1 gaps (fold into Phase 5 work)

- [ ] `not-found.tsx` (custom 404) + `error.tsx` (error boundary)
- [ ] Canonical URLs per page (`alternates.canonical` — only `metadataBase` set today)
- [ ] OG image 1200×630 + Twitter card image (none configured)
- [ ] Security headers in `next.config.ts` (HSTS, X-Frame-Options, CSP, Referrer-Policy) — none today
- [ ] GA4 + PostHog (EU) + cookie consent banner — zero analytics today
- [ ] Google Search Console verification + sitemap submission
- [ ] Homepage metadata: current title is root-layout default "AVEXA Stays — Live the city." — needs keyword title + meta description with primary keyword
- [ ] H1 copy check: code renders "Bucharest City Center, unlocked" vs approved "Bucharest City Center, Unlocked."
- [ ] Route naming decision: today `/stays/[id]` (accepts both id and slug); plan was `/properties/[slug]` + `/locations/[slug]` detail pages. Decide in Phase 5 spec (SEO impact, redirects)
- [ ] Location DETAIL pages (`/locations/[slug]` with 800+ words, embedded map) — do not exist; only the overview exists

---

## Phases 2–4 (original backend plan) — absorbed into Phase 5

> The UI surface of these phases exists in demo mode. The backend checklists
> below are KEPT AS INPUT for the Phase 5 spec — do not execute them directly;
> the approved spec supersedes them.

### Phase 2 — Booking System (UI ✅ demo / backend ❌)

- Supabase tables per ARCHITECTURE.md: profiles, properties, availability, bookings (+ RLS, indexes, generated types)
- `/lib/hostaway/client.ts`: listings, calendar, priceDetails, reservations; 60 req/min rate limit; retries
- Sync system: `/app/api/sync/hostaway/route.ts`, Vercel cron 15 min, manual trigger with Bearer auth
- Property pages on real data (ISR 15 min), availability calendar, live Hostaway price check before payment
- Stripe: checkout session creation, webhook (signature verify → create Hostaway reservation → confirm booking → Brevo email)
- Brevo transactional templates: confirmation, pre-arrival (PIN), checkout reminder, cancellation

### Phase 3 — Auth + Member Area (UI ✅ demo / backend ❌)

- Supabase Auth: Google OAuth + email (+ Apple per Phase 5 decision)
- Replace localStorage demo auth in: Nav, LoginForm, CheckoutApp gate, MyTripsApp, ProfileApp
- Real trips from bookings table; profile persistence; `noindex` on member pages
- Member rate (15%), 7+ night discount, loyalty tracking (3 trips → +10%)

### Phase 4 — Polish + Launch (not started)

- Performance audit (Lighthouse 95+, bundle analysis, real device testing)
- SEO QA (Rich Results, schema validation, alt text, 404 check, canonicals)
- Production checklist (env vars, Stripe LIVE, webhooks, backups, Vercel Pro, crons)
- Launch day: switch root from coming-soon → app, submit sitemap, monitor

---

## Phase 5 — Production Booking Platform (NEXT)

**Spec:** `/thoughts/plans/` — written after the 2026-06-12 interview, requires
Robert's explicit approval before any build work.

**Scope (from project owner):** Hostaway as source of truth (prices/availability),
Stripe payments + extra services, Supabase (DB + Google/Apple/email auth + storage),
Google Maps embed, video hero, multi-room booking (same-building suites),
Member Club discounts, mobile-first Airbnb-class UX/perf, SEO for
"Bucharest city center apartments". Plus the Phase-1 gap list above and the
design-system drift cleanup (see BRAND.md "Known drift" notes).

**Known UI gaps vs legacy prototypes (verify & decide in spec):** hero video
background, real Google Maps embeds (stay page map modal + inline nearby grid),
locations announcement bar, desktop "Show map" toggle, "Add another room" in
booking sidebar, business invoice fields (VAT/CUI/Reg. Com.) in checkout,
promo-code button, Apple Pay/Google Pay rows, icon-in-tile sizing issue.

---

## Phase 6 — Content + Growth (post-launch, ongoing)

- Guides/blog (`/guides`, `/guides/[slug]`): first 5 articles per original list
- Article schema, internal links to properties, outreach to Bucharest travel bloggers
- Off-page SEO: Google Business Profile, citations, press release, social profiles
- i18n (hreflang en/ro, /ro/ subpath) — optional
- PWA (manifest, service worker, offline page) — optional

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-06 | Next.js 15 App Router | SSR mandatory for SEO + modern patterns |
| 2026-06-06 | Supabase over Firebase | PostgreSQL needed for complex date queries |
| 2026-06-06 | Hostaway as source of truth | Already have contract, full PMS features |
| 2026-06-06 | Supabase as cache layer | Performance + cost savings on Hostaway calls |
| 2026-06-06 | Stripe Checkout over Elements | Faster integration + compliance handled |
| 2026-06-06 | Brevo for emails | Already have account |
| 2026-06-06 | "No front desk. No friction. No compromise." | Differentiator vs NUMA |
| 2026-06-06 | "Bucharest City Center, Unlocked." H1 | Primary keyword + brand voice |
| 2026-06-07 | `motion` package (motion/react), not framer-motion | Standalone Motion release; same API |
| 2026-06-07 | Routes shipped as `/stays/[id]` | De facto during port; revisit vs `/properties/[slug]` in Phase 5 spec |
| 2026-06-12 | npm is the package manager | `package-lock.json` tracked; pnpm references in docs were aspirational |
| 2026-06-12 | ESLint CLI flat config | `next lint` deprecated, removed in Next 16 |
| 2026-06-12 | Phases renumbered | Production build = Phase 5; Content+Growth → Phase 6 |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hostaway API rate limits | Medium | High | Cache via Supabase, 15min sync |
| Stripe webhook fails | Low | Critical | Idempotency + retry queue |
| SEO ranking takes longer than 6 months | Medium | Medium | Content strategy + outreach |
| Vercel costs exceed budget | Low | Medium | Monitor with budget alerts |
| Hostaway price/availability mismatch | Low | High | Live check before payment |
| Demo → real data migration breaks UI | Medium | High | Keep `Property` type stable; adapter layer Hostaway→type |
| Usage-limit pauses mid-build | High | Medium | Wave protocol: every chunk commits clean + resume note in LEARNINGS.md |
