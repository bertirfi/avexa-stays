# SEO Audit

Your job: audit a specific page or component for SEO compliance.

## SEO Checklist

### Metadata
- [ ] Title tag unique, under 60 chars, contains primary keyword
- [ ] Meta description unique, under 155 chars, compelling
- [ ] Canonical URL set via metadata API
- [ ] Open Graph tags complete (title, description, image, url, type)
- [ ] Twitter Card tags complete (card, title, description, image)

### Content Structure
- [ ] Single H1 per page, keyword-rich
- [ ] H2/H3 hierarchy logical (no skipping levels)
- [ ] Primary keyword in first 100 words
- [ ] Keyword density natural (1-2%, not stuffed)
- [ ] Internal links to related pages
- [ ] External links to authoritative sources where helpful

### Images
- [ ] All use `next/image` (not `<img>`)
- [ ] All have descriptive alt text with keywords
- [ ] All have appropriate dimensions
- [ ] All optimized (WebP/AVIF served)
- [ ] LCP image has `priority` prop

### Links
- [ ] All internal links use `<Link>` (not `<a href>`)
- [ ] No broken links (404)
- [ ] No orphan pages (linked from somewhere)
- [ ] Anchor text descriptive (not "click here")

### Structured Data
- [ ] JSON-LD present
- [ ] Validates on schema.org
- [ ] Validates on Google Rich Results Test
- [ ] Appropriate schema type used
- [ ] Required fields all populated

### Technical
- [ ] Page is server-rendered (view source shows content)
- [ ] No render-blocking JS
- [ ] No layout shift (CLS < 0.1)
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] URL is SEO-friendly slug (lowercase, hyphens, keywords)

### Mobile
- [ ] Responsive at 375px, 768px, 1024px
- [ ] Touch targets > 44x44px
- [ ] Text readable without zoom
- [ ] No horizontal scroll

### Accessibility (SEO indirect impact)
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels where needed
- [ ] Color contrast WCAG AA
- [ ] Form labels present

## Report Format

```markdown
# SEO Audit Report: [Page Name]

## URL
https://avexastays.com/[path]

## Overall Score: X/100

### Passing (✅)
- Check 1
- Check 2

### Failing (❌)
- Check 1: specific issue + file:line + fix recommendation
- Check 2: specific issue + file:line + fix recommendation

### Warnings (⚠️)
- Check 1: not failing but could improve

## Top 3 Improvements (Priority Order)
1. **High impact:** Description + estimated effort
2. **Medium impact:** Description + estimated effort
3. **Low impact:** Description + estimated effort

## Schema Validation
- Schema type: LodgingBusiness
- Validates on schema.org: ✅
- Validates on Rich Results Test: ✅ / ❌ (errors)
- Eligible for rich snippet: ✅ / ❌

## Keyword Analysis
- Primary keyword "Bucharest city center apartments":
  - In title: ✅
  - In H1: ✅
  - In first paragraph: ✅
  - In H2: ✅
  - In meta description: ✅
  - In URL: ❌ (consider adding)
- Density: X% (target 1-2%)

## Lighthouse Estimate
- Performance: X/100
- Accessibility: X/100
- Best Practices: X/100
- SEO: X/100

## Next Actions
- [ ] Action 1 (file to modify)
- [ ] Action 2 (file to modify)
```
