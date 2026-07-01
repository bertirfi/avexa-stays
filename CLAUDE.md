# AVEXA STAYS — Bucharest City Center Apartments

> **Steering index.** This file holds only always-true facts + pointers. Procedures live in skills, path-scoped constraints in rules, hard guardrails in hooks (see "Where instructions live"). Keep this file under 200 lines; it has an owner (Robert) — review changes to it like code. Full map: `thoughts/steering-framework.md`.

## Mission
Premium direct-booking platform for Bucharest city-center apartments. Every decision serves four goals:
1. Rank #1–3 on Google for **"Bucharest city center apartments"**
2. Convert visitors at 4%+ via direct booking
3. Load under 2s globally on mobile
4. A luxury experience matching the brand

Dark editorial aesthetic + gold accents. Positioning: "No front desk. No friction. No compromise." · 15% member advantage. Client: Smighi · Dev: Robert. Live at avexastays.com (root serves `coming-soon.html` until launch; real app ships to the `feat/nextjs-platform` preview).

## Tech stack
- **Next.js 15** App Router · **TypeScript** strict · **Tailwind v4** · **motion** (import from `'motion/react'`, not framer-motion)
- **Supabase** (Postgres + Auth + RLS) · **Hostaway** PMS = source of truth for availability/price, cached in Supabase
- **Stripe** Checkout + webhooks · **Google Maps** (JS + Embed + Places) · **Resend** for auth email (via Supabase SMTP); Brevo for marketing later
- **Vercel** hosting · **PostHog + GA4** analytics (later)
- Rendering: SSG marketing · ISR property pages · server components by default, client only when interactive

## Commands
- Package manager: **npm** — `package-lock.json` is the source of truth, NOT pnpm.
- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` (auto-fix `npm run lint -- --fix`) · `npm run typecheck` — run both before every commit (also hook-enforced on code commits)
- `npm run db:types` — regenerate Supabase types

## Models — Opus plans, Sonnet builds
- **Opus 4.8** — orchestrator: decomposition, architecture, tradeoffs, review, user-facing synthesis. Keeps judgment.
- **Sonnet 5** — implementation/worker: bounded edits, repo/doc scans, tests (near-Opus quality, cheaper).
- **Haiku 4.5** — cheapest high-volume passes: log reduction, mechanical edits.
- Apply **efficient-fable** (registered skill) on non-trivial tasks: keep judgment with Opus, delegate token-heavy work to Sonnet/Haiku in parallel with self-contained handoff packets; vet subagent output before trusting it.

## Directory layout
```
app/(marketing)   SSG marketing (home, locations, guide, about)
app/(auth)        login / signup
app/(member)      my-trips / profile (SSR, protected)
app/book          booking flow
app/api           route handlers (checkout, webhooks/*, sync, cron, hostaway)
components/{ui,sections,seo,booking,property}
lib/{supabase,hostaway,maps,data} + pricing.ts, fx.ts, booking.ts
db/{schema,migrations,seed}   public/{logos,images,og}   thoughts/{research,plans,decisions}
```

## Style
- No `any` (use `unknown`). Tailwind only, no inline styles. Functional components only.
- Files `kebab-case.tsx` · components `PascalCase` · hooks `use-camel-case` · constants `UPPER_SNAKE_CASE`.
- Async server components over client + `useEffect`. Server actions for mutations (not /api for simple forms).
- Never `<img>` (use `next/image`). Never `<a href>` for internal nav (use Next `<Link>`).

## Where instructions live
Steering is split by load-timing and authority. Full rationale: `thoughts/steering-framework.md`.

- **Hard guardrails — deterministic, `.claude/settings.json` + `.claude/hooks/`:** block edits to `coming-soon.html`; block `vercel.json` on `main`; run lint+typecheck before any code commit and block on failure.
- **Path-scoped rules — `.claude/rules/` (load when you touch matching files):** `pricing.md`, `hostaway.md`, `api-validation.md`.
- **Skills — `.claude/skills/` (load when invoked):** `seo-audit`, `verify-frontend`, `deploy`, plus the registered `efficient-fable`. Workflow commands in `.claude/commands/`: `research`, `plan`, `implement`, `validate`.
- **Subagents — `.claude/agents/` (isolated, return a summary):** `code-reviewer` (sonnet), `build-log-analyzer` (haiku), `dependency-auditor` (sonnet).
- **Docs:** `BRAND.md` (brand/voice/colors/fonts) · `INTEGRATIONS.md` (setup + all env vars) · `ARCHITECTURE.md` (the WHY) · `PLAN.md` (phase/roadmap) · `thoughts/client-meeting-checklist.md` (client setup steps) · `LEARNINGS.md` (read at session start, update at end).

## Non-negotiables (must always stay in context)
- Never commit `.env.local` or secrets. Never push directly to `main` — feature branch + PR. Never touch `coming-soon.html` until launch (hook-enforced).
- **Hostaway server-side only**; all availability via the Supabase cache. Prices shown must match live Hostaway at payment — re-verify server-side before Stripe. (rules: `hostaway`, `pricing`)
- **Trust boundary:** verify webhook signatures (Stripe + Hostaway); validate `app/api/**` input with Zod; derive identity from the Supabase session, never a client localStorage mirror. (rule: `api-validation`)
- **SEO:** every page server-rendered with unique title (<60) / description (<155) / canonical + exactly one h1; primary keyword on home + locations. (skill: `seo-audit`)
- SEO and sub-2s performance are product goals, not afterthoughts — treat regressions as bugs.

## Workflow
Research → Plan → Implement → Validate (skills/commands above). One phase at a time; commit per phase; `/clear` between phases; keep context under ~60%. Update `LEARNINGS.md` each session.
