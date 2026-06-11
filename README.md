# AVEXA STAYS

> Premium short-term apartments in Bucharest city center.
> No front desk. No friction. No compromise.

**Live:** [avexastays.com](https://avexastays.com)

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Framer Motion
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + Google OAuth
- **Payments:** Stripe
- **PMS:** Hostaway
- **Maps:** Google Maps + Places API
- **Email:** Brevo
- **Hosting:** Vercel
- **Analytics:** PostHog + Google Analytics 4

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values
cp .env.example .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Documentation

| File | Purpose |
|------|---------|
| [CLAUDE.md](./CLAUDE.md) | AI assistant context (tech stack, rules, conventions) |
| [PLAN.md](./PLAN.md) | Implementation roadmap and phases |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, schemas, data flow |
| [BRAND.md](./BRAND.md) | Brand system, copy, colors, voice |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | API setup for all third-party services |
| [LEARNINGS.md](./LEARNINGS.md) | Self-improving session knowledge |

---

## Development Workflow

For non-trivial features, follow:

1. **Research** — understand existing code
2. **Plan** — design before coding
3. **Implement** — execute one phase at a time
4. **Validate** — test, lint, verify

Use slash commands in Claude Code:
```
/research [topic]
/plan [feature]
/implement [plan]
/validate
/seo-audit [page]
```

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint --fix   # Fix linting issues
pnpm typecheck    # TypeScript check
pnpm test         # Run tests
```

---

## Project Status

**Current phase:** Phase 1 — Foundation + SEO Core

See [PLAN.md](./PLAN.md) for detailed roadmap.

---

## License

Proprietary. © 2026 AVEXA Stays.
