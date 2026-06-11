# Implementation Phase

Your job: execute the approved plan, one phase at a time.

## Steps

1. Read the plan from `/thoughts/plans/[plan-file].md`
2. Execute ONLY the specified phase (don't jump ahead)
3. After each file change:
   - Run `pnpm lint --fix` on changed files
   - Run `pnpm typecheck` to verify
4. Commit when phase is complete with descriptive message
5. Update PLAN.md to mark task as done
6. Update LEARNINGS.md if you discovered anything new
7. Stop after this phase. Report to user.

## Rules

- ONE phase at a time. Do not start phase 2 until user approves.
- Follow CLAUDE.md style conventions strictly
- Never use `<img>` (use `next/image`)
- Never use `<a href>` for internal nav (use `<Link>`)
- All pages must be server components by default
- All images must have descriptive alt text
- All new metadata must be unique
- All structured data must validate

## Commit Message Format

```
feat(scope): Brief description

- What changed
- Why it changed
- Reference to plan file

Related: thoughts/plans/YYYY-MM-DD-feature.md
```

## After Implementation

Report:
- What was implemented
- Files changed (list)
- Tests added
- Verification steps to run
- Any deviations from plan (with justification)

**Then `/clear` context before validation.**
