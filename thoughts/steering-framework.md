# Steering framework — where each instruction lives

**Owner:** Robert. Review changes to this map (and to `CLAUDE.md`) like code.

Based on Anthropic's "Steering Claude Code: skills, hooks, rules, subagents, and more." Instructions are placed by **load timing, compaction behavior, authority, and context cost** — not dumped into one file.

## Authority ladder (low → high)
Advisory text (`CLAUDE.md`, rules, skills, subagent bodies — a model *can* miss these under pressure, long sessions, or prompt injection) **<** Deterministic (hooks + permissions, enforced by the harness, bypass compaction).

**=> Anything that must NOT be violated is a hook, not text.** Text says "please"; a hook says "no".

## Placement

| Instruction | Home | Loads | Why here |
|---|---|---|---|
| Always-true facts + index | `CLAUDE.md` | session start (re-injected on compaction) | small, high-value, kept <200 lines |
| coming-soon.html / vercel.json-on-main / lint+typecheck | `.claude/hooks/*.js` + `.claude/settings.json` | at tool-call time (`PreToolUse`) | must be deterministic; exit code 2 blocks |
| pricing / hostaway / api-validation | `.claude/rules/*.md` (`paths:` globs) | only when matching files are touched | cross-cutting but scoped — out of context otherwise |
| seo-audit / verify-frontend / deploy | `.claude/skills/*/SKILL.md` | only when invoked | procedural, relevant only sometimes |
| code-reviewer / build-log-analyzer / dependency-auditor | `.claude/agents/*.md` | only when delegated (Agent tool) | isolated, token-heavy; return a summary; run on cheap models |

## The hooks (deterministic guardrails)
- `guard-protected-files.js` — blocks any Edit/Write to `coming-soon.html` (live on the root domain) and to `vercel.json` while on `main`.
- `pre-commit-checks.js` — before a `git commit` that stages app code (`.ts/.tsx/.js/...`, excluding `.claude/`), runs `npm run lint` + `npm run typecheck` and blocks the commit (exit 2) on failure. Docs/config-only commits skip the checks to stay fast.

Test a hook without committing: pipe a sample tool-call JSON to it, e.g.
`echo '{"tool_input":{"file_path":"coming-soon.html"}}' | node .claude/hooks/guard-protected-files.js; echo $?` → expect `2`.

## What moved out of CLAUDE.md (was ~310 lines → ~80)
- 13 "Critical Rules" → hooks (guardrails) + rules (`hostaway`/`pricing`/`api-validation`) + a short non-negotiables list.
- 15 "SEO Critical Rules" → `skills/seo-audit`.
- Architecture "WHY" → `ARCHITECTURE.md`. Brand tokens → `BRAND.md`. Integrations + env → `INTEGRATIONS.md`.
- Pre-commit checklist → `skills/deploy` + the lint/typecheck hook.

## Models (efficient orchestration — model-agnostic)
The orchestrator is the selected advanced model (Fable 5, Opus 4.8, or whatever Robert picks — changes over time). It keeps judgment (planning, reviews, architecture, integration, final review); Sonnet 5 takes all delegated implementation and bulk/mechanical passes — never Haiku. The cost/intelligence/taste routing table lives in CLAUDE.md ("Model routing") and Robert tunes it per subscription. Subagent models come from `CLAUDE_CODE_SUBAGENT_MODEL` env var or per-agent `model:` frontmatter — a .md instruction alone doesn't change them. Convention: `efficient-fable` skill.

## Self-verification (loops)
The `verify-frontend` skill encodes the loop from Anthropic's "Getting started with loops": open the real route, exercise the change, assert the user-visible result, check the console, test mobile + desktop, iterate until clean. "The edit applied" is never proof.
