---
name: deploy
description: Ship a change safely to a Vercel preview and prepare a PR — runs quality gates, commits on the feature branch, pushes, verifies the preview, and respects the hard rules (never push main, never touch coming-soon.html, correct env-var scopes). Use when asked to deploy, ship, push, or open a PR.
---

# Deploy (preview-first)

Production (`avexastays.com`) serves `coming-soon.html` from `main` until launch. All real work ships to the `feat/nextjs-platform` **preview**. Never push to `main` directly.

## Before commit
1. `npm run lint` and `npm run typecheck` both pass. (A `PreToolUse` hook also blocks a commit whose code changes fail either check — don't rely on it, run them yourself.)
2. No `console.log` in production code, no commented-out code, no secrets in the diff.
3. If architecture changed → update `CLAUDE.md`. If it's a new setup step → update `thoughts/client-meeting-checklist.md`.

## Commit + push
4. Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Never `--no-verify`.
5. `git push origin feat/nextjs-platform` → Vercel builds a preview automatically.

## Verify on preview
6. Wait for the new build to go live, then run the **verify-frontend** skill against the preview URL (real browser, console clean, mobile + desktop). Not shipped until the preview is verified.

## Env-var scopes (Vercel)
- `NEXT_PUBLIC_*` are inlined at **build** — after adding/changing one, **Redeploy** so it takes effect.
- App keys (Stripe `pk_`/`sk_`, Maps, Supabase URL/anon) live in **Vercel env**. Google OAuth Client ID/Secret and the Resend SMTP key live in **Supabase**, NOT Vercel. Test keys → Preview scope; live keys → Production at launch.

## Hard rules (also enforced by hooks)
- Never edit `coming-soon.html` (hook-blocked).
- Never edit `vercel.json` on `main` (hook-blocked).
- Never push directly to `main` — open a PR from the feature branch.
