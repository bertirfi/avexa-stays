# Validation Phase

Your job: verify implementation matches the plan and works correctly.

## Steps

1. Compare files changed vs plan files list
2. Run quality checks:
   - `npm run lint` (no errors)
   - `npm run typecheck` (no errors)
   - `npm test` if tests exist
3. Test the feature in browser (preview URL)
4. Check edge cases listed in plan
5. Verify SEO requirements:
   - View source: meta tags present
   - Heading hierarchy correct
   - Images have alt text
   - Structured data validates (Rich Results Test)
6. Check accessibility:
   - Keyboard navigation works
   - Screen reader friendly
   - Color contrast sufficient
7. Mobile responsive (375px, 768px, 1024px)
8. Performance:
   - Lighthouse score on changed pages
   - Bundle size impact
9. Update LEARNINGS.md with discoveries
10. Report results to user

## Report Format

```markdown
# Validation Report: [Feature]

## Pass/Fail Summary
- ✅ Lint passes
- ✅ TypeCheck passes
- ✅ Tests pass (X/Y)
- ❌ Lighthouse SEO 89/100 (target 95)
- ✅ Mobile responsive

## Files Implemented vs Plan
- ✅ /path/to/file1.ts (planned + done)
- ✅ /path/to/file2.ts (planned + done)
- ⚠️ /path/to/file3.ts (added but not in plan — reason: ...)

## Edge Cases Tested
- ✅ Empty state shows correctly
- ✅ Error state handles network failure
- ❌ Loading state too long (TODO: optimize)

## SEO Verification
- Title: "..." (X chars, ✅ under 60)
- Description: "..." (Y chars, ✅ under 155)
- Canonical: ✅ set
- H1: "..." (one only, ✅)
- Schemas: LodgingBusiness ✅, BreadcrumbList ✅
- Rich Results Test: ✅ valid

## Issues Found
1. Issue description + recommended fix
2. Issue description + recommended fix

## Next Steps
- [ ] Address issues above
- [ ] Move to next phase: [name]
```
