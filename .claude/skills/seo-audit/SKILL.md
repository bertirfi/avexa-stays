---
name: seo-audit
description: Audit a page or component for SEO compliance — metadata, heading hierarchy, images, internal links, structured data, Core Web Vitals, mobile, and the primary keyword "Bucharest city center apartments". Use when adding or changing a marketing/property page, or when asked to check SEO. Produces a scored checklist with file:line fixes.
---

# SEO audit

Audit a specific page or component for SEO compliance. Primary keyword: **"Bucharest city center apartments"**.

## Checklist

### Metadata
- [ ] Title unique, under 60 chars, contains primary keyword
- [ ] Meta description unique, under 155 chars, compelling
- [ ] Canonical URL set via the Metadata API
- [ ] Open Graph tags complete (title, description, image, url, type)
- [ ] Twitter Card tags complete (card, title, description, image)

### Content structure
- [ ] Single H1 per page, keyword-rich
- [ ] H2/H3 hierarchy logical (no skipped levels)
- [ ] Primary keyword in first 100 words
- [ ] Keyword density natural (1–2%, not stuffed)
- [ ] Internal links to related pages; descriptive anchor text (not "click here")

### Images
- [ ] All use `next/image` (never `<img>`)
- [ ] All have descriptive alt text with keywords
- [ ] Descriptive file names (calea-victoriei-luxury-apartment.jpg, not IMG_4521.jpg)
- [ ] LCP image has `priority`

### Links
- [ ] All internal links use Next `<Link>` (never `<a href>`)
- [ ] No broken links; no orphan pages

### Structured data
- [ ] JSON-LD present and appropriate type (LodgingBusiness, BreadcrumbList, etc.)
- [ ] Validates on schema.org and Google Rich Results Test
- [ ] Required fields populated

### Technical + mobile
- [ ] Server-rendered (view source shows content)
- [ ] SEO-friendly slug (lowercase, hyphens, keywords)
- [ ] CLS < 0.1, LCP < 2.5s, INP < 200ms
- [ ] Responsive at 375 / 768 / 1024px; tap targets > 44px; no horizontal scroll

## Report format

```markdown
# SEO Audit: [Page]  — URL: https://avexastays.com/[path]

## Score: X/100
### Passing ✅ / Failing ❌ (with file:line + fix) / Warnings ⚠️

## Keyword "Bucharest city center apartments"
- In title / H1 / first paragraph / an H2 / meta description / URL: ✅/❌

## Top 3 improvements (priority order, with file to modify)
```
