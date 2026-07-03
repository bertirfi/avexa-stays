# AVEXA STAYS — Bucharest City Center Apartments

> **Steering index.** This file holds only always-true facts + pointers. Procedures live in skills, path-scoped constraints in rules, hard guardrails in hooks (see "Where instructions live"). Keep this file under 200 lines; it has an owner (Robert) — review changes to it like code. Full map: `thoughts/steering-framework.md`.

## Mission
Premium direct-booking platform for Bucharest city-center apartments. Every decision serves four goals:
1. Rank #1–3 on Google for **"Bucharest city center apartments"**
2. Convert visitors at 4%+ via direct booking
3. Load under 2s globally on mobile
4. A luxury experience matching the brand

Dark editorial aesthetic + gold accents. Positioning: "No front desk. No friction. No compromise." · 15% member advantage. Client: Smighi · Dev: Robert. Live at avexastays.com (root serves `coming-soon.html` until launch; real app ships to the `feat/nextjs-platform` preview).

## Orchestration (every session)
The orchestrator is **the selected advanced model** (Fable 5, Opus 4.8, or whatever Robert picks — it changes over time; never assume a specific one). It keeps only high-value work — planning, codebase/systems review, architecture, code structure, integration design, final review — and **delegates the token-hungry grunt work** to cheaper models, split into MANY small self-contained tasks so no agent overflows its context. Full convention: the `efficient-fable` skill (model-agnostic efficient orchestration). Vet subagent output before trusting it.

**Model routing** — rankings, higher = better; cost ≈ what we pay in practice, intelligence = how hard a problem the model handles unsupervised, taste = UI/UX, code quality, API design, copy. Tune the numbers to the current subscription; the rules below read from this table:

| model | cost | intelligence | taste |
|----------|------|--------------|-------|
| sonnet-5 | 6 | 5 | 7 |
| opus-4.8 | 4 | 8 | 8 |
| fable-5 | 2 | 9 | 9 |

- These are defaults, not limits. Standing permission to override: if a cheaper model's output does not meet the bar, rerun or redo the work with a smarter model without asking. Judge the output, not the price tag. Escalating costs less than shipping mediocre work.
- Cost is a tie-breaker only. When axes conflict for anything that ships: intelligence > taste > cost.
- Bulk/mechanical work (clear-spec implementation, data analysis, migrations, codebase reading): send to the cheapest capable model — this is where most of the quota would otherwise go.
- Anything user-facing (UI, copy, API design) needs taste ≥ 7 — keep it on opus-4.8/fable-5.
- Reviews of plans/implementations: fable-5 or opus-4.8, optionally a second independent model for an extra perspective.
- **Never use Haiku.**
- Models are swapped via the Agent/Workflow `model` parameter (e.g. `model: 'sonnet'` for cheap mechanical work, `'opus'` when it needs more taste); the main session model via `/model`. Subagent defaults: the `CLAUDE_CODE_SUBAGENT_MODEL` env var or `model:` frontmatter in `.claude/agents/*` — a `.md` instruction alone does NOT change subagent models.

## Tech stack
- **Next.js 15** App Router · **TypeScript** strict · **Tailwind v4** · **motion** (import from `'motion/react'`, not framer-motion)
- **Supabase** (Postgres + Auth + RLS) · **Hostaway** PMS = source of truth for availability/price, cached in Supabase
- **Stripe** Checkout + webhooks · **Google Maps** (JS + Embed + Places) · **Resend** for auth email (via Supabase SMTP), the refund notice + newsletter (Audiences, `RESEND_AUDIENCE_ID`)
- **Vercel** hosting · **PostHog + GA4** analytics (later)
- Rendering: SSG marketing · ISR property pages · server components by default, client only when interactive

## Commands
- Package manager: **npm** — `package-lock.json` is the source of truth, NOT pnpm.
- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` (auto-fix `npm run lint -- --fix`) · `npm run typecheck` — run both before every commit (also hook-enforced on code commits)
- `npm run db:types` — regenerate Supabase types

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
- **Subagents — `.claude/agents/` (isolated, return a summary):** `code-reviewer` (sonnet), `build-log-analyzer` (sonnet), `dependency-auditor` (sonnet).
- **Docs:** `BRAND.md` (brand/voice/colors/fonts) · `INTEGRATIONS.md` (setup + all env vars) · `ARCHITECTURE.md` (the WHY) · `PLAN.md` (phase/roadmap) · `thoughts/client-meeting-checklist.md` (client setup steps) · `LEARNINGS.md` (read at session start, update at end).

## Non-negotiables (must always stay in context)
- Never commit `.env.local` or secrets. Never push directly to `main` — feature branch + PR. Never touch `coming-soon.html` until launch (hook-enforced).
- **Hostaway server-side only**; all availability via the Supabase cache. Prices shown must match live Hostaway at payment — re-verify server-side before Stripe. (rules: `hostaway`, `pricing`)
- **Trust boundary:** verify webhook signatures (Stripe + Hostaway); validate `app/api/**` input with Zod; derive identity from the Supabase session, never a client localStorage mirror. (rule: `api-validation`)
- **SEO:** every page server-rendered with unique title (<60) / description (<155) / canonical + exactly one h1; primary keyword on home + locations. (skill: `seo-audit`)
- SEO and sub-2s performance are product goals, not afterthoughts — treat regressions as bugs.

## Workflow
Research → Plan → Implement → Validate (skills/commands above). One phase at a time; commit per phase; `/clear` between phases; keep context under ~60%. Update `LEARNINGS.md` each session.
