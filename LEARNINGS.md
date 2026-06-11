# AVEXA — Session Learnings

> Self-improving knowledge base. Read at the start of every session, 
> update at the end. Captures patterns, mistakes, and useful snippets.

---

## How to Use This File

**At session start:**
- Read this file before doing anything
- Note any relevant patterns for current task

**At session end:**
- Add new learnings under appropriate section
- Be specific (what worked, why, where)
- Include code snippets when useful
- Reference files with /path/file.ts:line

---

## Patterns That Work Well

(Empty — will be populated as we work)

Examples of what to add here:
- "Supabase queries are faster when you select() specific columns"
- "Next.js generateMetadata works best with parent params"
- "Stripe webhooks require raw body for signature verification"

---

## Patterns to Avoid

(Empty — will be populated as we work)

Examples:
- "Don't call Hostaway from middleware — too slow"
- "Don't use NEXT_PUBLIC_ for any secret"
- "Don't fetch in client useEffect when server component would work"

---

## Recurring Mistakes (Don't Repeat)

(Empty — will be populated as we work)

Examples:
- "Forgot to add new env var to Vercel after adding locally"
- "Missing 'use client' on component using hooks"
- "Wrong Hostaway field name — it's 'price', not 'rate'"

---

## Useful Code Snippets

### Generate secrets
```bash
openssl rand -base64 32
```

### Check Vercel deployment logs
```bash
vercel logs [deployment-url] --follow
```

### Force re-sync Hostaway manually
```bash
curl -X POST https://avexastays.com/api/sync/hostaway \
  -H "Authorization: Bearer $SYNC_SECRET"
```

### Supabase TypeScript types regeneration
```bash
pnpm db:types
# Runs: supabase gen types typescript --linked > db/types.ts
```

---

## Hostaway API Quirks

(Empty — will be populated as we discover them)

Things to document here:
- Specific field names that differ from documentation
- Rate limit behavior
- Edge cases in calendar response
- Reservation creation gotchas

---

## Stripe Integration Notes

(Empty — will be populated)

Things to document:
- Webhook event ordering issues
- Idempotency key strategy
- Test card numbers for specific scenarios
- 3DS challenge handling

---

## SEO Discoveries

(Empty — will be populated)

Things to document:
- What schemas actually showed in Search Console
- Which keywords ranked surprisingly
- Page speed bottlenecks identified
- Specific structured data issues

---

## Performance Insights

(Empty — will be populated)

- LCP optimizations that worked
- Bundle size wins
- Image format decisions
- Cache strategies

---

## Build/Deploy Issues

(Empty — will be populated)

- Vercel deployment failures and fixes
- TypeScript errors and resolutions
- Package version conflicts

---

## User Feedback Patterns

(Empty — will be populated after launch)

- Common questions
- Friction points in booking flow
- Mobile vs desktop behavior differences

---

## Decisions That Required Backtracking

(Empty — will be populated)

- "Initially used X, switched to Y because Z"
- Lessons learned from technical pivots
