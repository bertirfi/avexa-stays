# Planning Phase

Your job: create a detailed implementation plan.

**RULE: DO NOT WRITE PRODUCTION CODE YET. Only plans and pseudo-code.**

## Steps

1. Reference research from `/thoughts/research/[file].md`
2. Break feature into atomic tasks (each one commitable independently)
3. Identify which files need changes (create vs modify)
4. List dependencies between tasks
5. Define success criteria for each task
6. Identify risks and edge cases
7. Save plan to `/thoughts/plans/YYYY-MM-DD-[feature].md`
8. Wait for user approval before implementing

## Output Format

```markdown
# Plan: [Feature Name]

## Goal
Single sentence stating what this delivers.

## Success Criteria
- Functional: User can do X
- Non-functional: Page loads under 2s
- SEO: Schema validates, indexed within 7 days
- Tests: 80% coverage on new code

## Phases

### Phase 1: [Name]
**Goal:** Specific outcome
**Estimated time:** X hours

Tasks:
1. Create file /path/to/file.ts
   - What it does
   - Why this approach
   - Verification: how to test it works

2. Modify /path/to/existing.ts
   - What changes
   - Why
   - Verification

3. Add tests in /path/to/test.ts
   - What scenarios to test

**Acceptance:** Bullet list of what must be true before moving to next phase

### Phase 2: [Name]
... same structure

## Dependencies
- Phase 2 depends on Phase 1 completing
- External: requires HOSTAWAY_API_KEY in env

## Risks
- Risk 1: description + mitigation strategy
- Risk 2: description + mitigation strategy

## SEO Considerations
- Page must be server-rendered
- Required schemas: LodgingBusiness, BreadcrumbList
- Metadata: title under 60 chars, description under 155
- Primary keyword usage: H1, first paragraph, one H2

## Rollback Plan
If this fails or needs reverting:
- Step 1
- Step 2

## Open Questions for User
- Question 1
- Question 2
```

## After Planning

Present plan to user. Wait for approval.
**Then `/clear` context before implementing.**
