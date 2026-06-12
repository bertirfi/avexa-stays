# AVEXA STAYS — Bucharest City Center Apartments

## Core Mission

Build a hospitality platform that:
1. Ranks #1-3 on Google for "Bucharest city center apartments"
2. Converts visitors at 4%+ rate via direct booking
3. Loads in under 2s globally on mobile
4. Provides a luxury experience matching the brand promise

Every decision must support these 4 goals.

---

## Orchestration — Efficient Fable (ALWAYS)

Apply the `efficient-fable` convention (`.claude/skills/efficient-fable/SKILL.md`) on every non-trivial task:

- **Fable keeps judgment:** decomposition, architecture, tradeoffs, shared-file coordination, integration, final review, and user-facing synthesis.
- **Delegate to cheaper subagents:** token-heavy repo/doc scans, bounded code edits, test/browser passes, and log reduction — in parallel when slices are independent.
- **Handoff packets:** delegated prompts must be self-contained — repo path, exact objective, in/out of scope, evidence format (files, line refs, commands, diffs), verification steps, and stop conditions.
- **Vet before trusting:** treat subagent reports as leads. Reopen important cited files and review the final diff before high-impact decisions, PRs, or telling the user it's done.

Keep tiny tasks and judgment-sensitive validation with Fable.

---

## Project Overview

AVEXA is a premium short-term rental platform for Bucharest city center apartments. Built for travelers who value design, efficiency, and absolute privacy. Modeled after numastays.com but differentiated through:
- Dark editorial aesthetic with gold accents (vs NUMA's light, pink)
- "No front desk. No friction. No compromise." positioning
- Focus on Bucharest city center specifically
- Direct booking with 15% member advantage

**Live URL:** avexastays.com
**Repository:** github.com/[user]/avexa-stays
**Client:** Smighi (project owner)
**Developer:** Robert (bertirfi)

---

## Tech Stack (WHAT)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS v4
- **Animations:** Motion (`motion` package — import from `'motion/react'`, not framer-motion)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Google OAuth (Apple later)
- **Payments:** Stripe (Checkout + webhooks)
- **Maps:** Google Maps JavaScript API + Places API (New) + Geocoding
- **PMS Integration:** Hostaway API (source of truth)
- **Email:** Brevo (transactional + marketing)
- **Hosting:** Vercel (Pro plan when live for commercial use)
- **Analytics:** PostHog + Google Analytics 4
- **Monitoring:** Vercel Analytics + Speed Insights

---

## Architecture Decisions (WHY)

- **Next.js App Router** — SSR mandatory for SEO + server actions for booking flow
- **Supabase over Firebase** — PostgreSQL needed for complex booking queries with date ranges
- **Hostaway is source of truth** for availability/prices, Supabase caches for performance
- **Vercel cron jobs** sync Hostaway → Supabase every 15 minutes (avoid rate limits)
- **Stripe Checkout** (not Elements) — handles compliance, 3DS, all payment methods automatically
- **Webhook-driven booking creation** — Stripe webhook creates Hostaway reservation only after successful payment
- **ISR for property pages** — fresh data without rebuild on every visit
- **Server components by default** — client components only when interactivity needed
- **SSG for marketing pages** — maximum speed for SEO

---

## Commands (HOW)

```bash
# Package manager: npm (package-lock.json is the source of truth — NOT pnpm)

# Setup
npm install
cp .env.example .env.local  # then fill in values

# Development
npm run dev                 # local dev server
npm run build               # production build
npm run start               # run production locally

# Quality (run both before EVERY commit)
npm run lint                # ESLint flat config; auto-fix: npm run lint -- --fix
npm run typecheck           # TypeScript checking

# Not yet implemented (add during Phase 5):
# test, test:e2e, db:migrate, db:seed, db:types

# Deployment
git push origin feat/xyz    # Vercel creates preview URL
# main auto-deploys production — main serves coming-soon.html until launch switch
```

---

## Critical Rules — DO NOT VIOLATE

1. **NEVER** commit `.env.local` or any secrets to git
2. **NEVER** push directly to main — always via PR with preview deploy
3. **NEVER** touch `/coming-soon.html` until launch — it's live on root domain
4. **NEVER** call Hostaway API directly from client-side code
5. **ALL** availability checks must go through Supabase, not direct Hostaway calls
6. **ALL** prices shown to users must match Hostaway exact pricing at booking moment (live check before payment)
7. **ALWAYS** run `npm run lint && npm run typecheck` before every commit
8. **ALWAYS** use server components by default, client components only when needed
9. **NEVER** use `<img>`, always use `next/image` for automatic optimization
10. **NEVER** use `<a href>` for internal navigation, use Next.js `<Link>`
11. **NEVER** store sensitive data in localStorage or cookies without encryption
12. **ALWAYS** verify webhook signatures (Stripe + Hostaway)
13. **NEVER** trust client-side validation for security — re-validate on server

---

## SEO Critical Rules

**PRIMARY KEYWORD: "Bucharest city center apartments"**

1. **ALL pages MUST be server-rendered** (SSR or SSG), never client-only
2. **EVERY page MUST have unique title** (max 60 chars) and meta description (max 155 chars)
3. **EVERY page MUST have canonical URL** set via metadata
4. **EVERY image MUST have descriptive alt text** with relevant keywords
5. **ALL h1 tags MUST be unique per page** (one h1 per page only)
6. **NEVER skip heading levels** (h1 → h2 → h3, not h1 → h3)
7. **ALL structured data MUST validate** on schema.org and Google Rich Results Test
8. **PRIMARY keyword "Bucharest city center"** MUST appear in:
   - Homepage H1
   - Homepage meta description
   - Homepage first paragraph
   - At least one H2 on homepage
   - Locations page title and H1
9. **Image file names** MUST be descriptive (calea-victoriei-luxury-apartment.jpg, NOT IMG_4521.jpg)
10. **URL slugs** MUST be lowercase, hyphenated, keyword-rich
11. **Every property page** MUST have unique 200+ word description
12. **ALWAYS preload critical fonts** via next/font/google
13. **NEVER hide important content** with display:none or JS-only rendering
14. **ALL internal links** MUST use Next.js `<Link>` component
15. **NEVER block crawlers** in robots.txt for indexable pages

---

## File Structure

```
/app
  /(marketing)              Public marketing pages (SSG)
    /page.tsx               Homepage
    /locations/page.tsx     Locations overview
    /locations/[slug]/page.tsx
    /member-benefits/page.tsx
    /guides/page.tsx
    /about/page.tsx
  /(auth)                   Authentication flows
    /login/page.tsx
    /signup/page.tsx
  /(member)                 Member dashboard (SSR, protected)
    /my-trips/page.tsx
    /profile/page.tsx
  /properties               Property browsing (ISR)
    /page.tsx
    /[slug]/page.tsx
  /book                     Booking flow
    /[propertyId]/page.tsx
  /api                      API routes
    /properties/route.ts
    /availability/[id]/route.ts
    /checkout/route.ts
    /webhooks/stripe/route.ts
    /webhooks/hostaway/route.ts
    /sync/hostaway/route.ts
  /layout.tsx               Root layout with global SEO
  /sitemap.ts               Auto-generated sitemap
  /robots.ts                Robots configuration

/components
  /ui                       Reusable UI primitives
  /sections                 Page sections (Hero, etc.)
  /seo                      SEO components (schemas)
  /booking                  Booking flow components
  /property                 Property display components

/lib
  /supabase                 Supabase clients
  /hostaway                 Hostaway API client
  /stripe                   Stripe utilities
  /maps                     Google Maps utilities
  /email                    Brevo email templates

/db
  /schema.sql
  /migrations/
  /seed.sql

/public
  /logos
  /images
  /og

/thoughts                   Planning artifacts
  /research
  /plans
  /decisions
```

---

## Style Conventions

- TypeScript strict mode, no `any` (use `unknown` if truly unknown)
- Tailwind classes only, no inline styles
- Functional components only, no class components
- File naming: `kebab-case.tsx`
- Component naming: `PascalCase`
- Hook naming: `use-camel-case`
- Constants: `UPPER_SNAKE_CASE`
- Async server components preferred over client + useEffect
- Server actions for mutations (no /api routes for simple form submissions)

---

## Brand System

See **BRAND.md** for complete brand system, copy, voice, and tone.

Quick reference colors:
```css
--ink: #191919          /* Primary text + dark bg */
--gold: #DDB97A         /* Primary accent */
--gold-dark: #B08840    /* Gold hover/active */
--gold-pale: #F7EDDB    /* Gold backgrounds */
--cream: #FAF9F5        /* Light bg alternative */
```

Quick reference fonts:
- Display: Plus Jakarta Sans 800 (`.font-display`)
- Body: Manrope 400 default (300–700 loaded)
- Mono: DM Mono 500, 10px uppercase labels (`.font-mono-label`)

---

## Integrations

See **INTEGRATIONS.md** for:
- Hostaway API setup
- Stripe configuration
- Supabase schema and RLS
- Google Maps APIs
- Brevo email
- All environment variables

---

## Current State

See **PLAN.md** for current phase and roadmap.

---

## Workflow (Research → Plan → Implement → Validate)

**NEVER skip this workflow for non-trivial changes.**

```
1. /research [topic]
   → Output: /thoughts/research/YYYY-MM-DD-topic.md
   → /clear context

2. /plan [feature]
   → Output: /thoughts/plans/YYYY-MM-DD-feature.md
   → Review with user before proceeding
   → /clear context

3. /implement [plan file]
   → Execute ONE phase at a time
   → Commit when phase complete
   → /clear context

4. /validate
   → Tests, lint, typecheck, browser test
   → Update LEARNINGS.md
```

**Context Management:**
- Never exceed 60% context usage
- Use `/clear` between phases
- Save artifacts to `/thoughts/` for reference

---

## Learnings

After every session, update **LEARNINGS.md** with what worked, what broke, and patterns to keep or avoid. Read LEARNINGS.md at the start of every session.

---

## Pre-Commit Checklist

- [ ] `npm run lint` passes (auto-fix: `npm run lint -- --fix`)
- [ ] `npm run typecheck` passes
- [ ] No console.log in production code
- [ ] No commented-out code
- [ ] Environment variables documented
- [ ] CLAUDE.md updated if architecture changed
