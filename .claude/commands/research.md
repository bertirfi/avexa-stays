# Research Phase

Your job: understand what exists before changing it.

**RULE: DO NOT WRITE ANY CODE IN THIS PHASE.**

## Steps

1. Read all relevant files in the codebase
2. Understand current patterns and conventions
3. Identify what exists vs what needs to be added
4. Document findings with file:line references
5. Identify risks, edge cases, dependencies
6. Save research to `/thoughts/research/YYYY-MM-DD-[topic].md`

## Output Format

Create a markdown file with this structure:

```markdown
# Research: [Topic]

## Summary
2-3 sentence overview of findings.

## Current State
- File: /path/to/file.ts:42 — Description of what's there
- File: /path/to/another.ts:15 — What this does

## Patterns in Use
- Pattern 1: how it's used, where
- Pattern 2: how it's used, where

## Affected Areas
List of files that would need changes for this feature:
- /path/to/file1.ts — Why
- /path/to/file2.ts — Why

## External Dependencies
- API: Hostaway endpoint X
- Service: Stripe webhook event Y
- Library: package@version

## Risks / Edge Cases
- Edge case 1: description + mitigation
- Edge case 2: description + mitigation

## Open Questions
- Question 1 to clarify before planning
- Question 2 to clarify before planning

## Recommendations
- Approach A vs Approach B comparison
- Suggested next steps for planning phase
```

## After Research

Report findings summary to user.
**Then `/clear` context before moving to planning.**
