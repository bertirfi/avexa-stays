# AVEXA STAYS — Implementation Plan

> Last updated: 2026-06-06
> Current phase: **Phase 1 — Foundation + SEO Core**

---

## SEO Strategy

**Primary keyword:** "Bucharest city center apartments"

**Goals:**
- Rank top 3 on Google for primary keyword within 6 months of launch
- Lighthouse 95+ on all marketing pages
- Core Web Vitals "Good" (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Mobile-first, all pages crawlable
- 100% pages with unique meta + canonical + structured data

**Secondary keywords:**
- Short term rental Bucharest
- Premium apartments Bucharest
- Bucharest accommodation digital check-in
- Apartments Calea Victoriei
- Bucharest no front desk hotel

**Long-tail (per location page):**
- Apartments near Calea Victoriei
- Where to stay Old Town Bucharest
- Universitate Bucharest accommodation
- Piața Romană apartments

---

## Completed ✅

- [x] Brand identity finalized (Gold Editorial V4)
- [x] Coming soon page live on avexastays.com
- [x] DNS propagated, Google Workspace configured (MX + DKIM)
- [x] Logo export kit (30+ PNG variants)
- [x] Final copywriting written for homepage + locations
- [x] Google Maps API created + restricted + $50 budget alert
- [x] Supabase organization created (client = Owner)
- [x] Vercel project deployed (avexa-stays)
- [x] Tech stack chosen (Next.js + Supabase + Hostaway + Stripe + Brevo)
- [x] CLAUDE.md, PLAN.md, ARCHITECTURE.md, BRAND.md, INTEGRATIONS.md created
- [x] .claude/commands/ slash commands configured

---

## In Progress 🔄

- [ ] Push project to GitHub repository
- [ ] Initialize Next.js 15 project
- [ ] Gather final API keys (Hostaway, Stripe, Supabase)

---

## Phase 1 — Foundation + SEO Core (4 weeks)

**Goal:** Functional homepage + locations + member benefits on Next.js with complete SEO infrastructure.

### 1.1 Project Setup

- [ ] Create Next.js 15 project: `pnpm create next-app avexa-stays --typescript --tailwind --app`
- [ ] Configure TypeScript strict mode
- [ ] Setup Tailwind v4 with brand colors as CSS variables
- [ ] Configure `next.config.ts`:
  - Image domains (Supabase storage, Hostaway CDN)
  - Security headers (HSTS, X-Frame-Options, CSP)
  - Compression
- [ ] Setup ESLint + Prettier
- [ ] Install dependencies:
  - `@supabase/supabase-js @supabase/ssr`
  - `stripe`
  - `@googlemaps/js-api-loader`
  - `framer-motion`
  - `zod` (validation)
  - `lucide-react` (icons)
- [ ] Setup root layout with:
  - `metadataBase` URL
  - Default OG image
  - Twitter card defaults
  - Font loading via `next/font/google`
  - Theme color meta tag

### 1.2 SEO Infrastructure

- [ ] Create `/app/sitemap.ts` auto-generating:
  - Static marketing pages (priority 1.0)
  - All location pages (priority 0.9)
  - All active properties from Supabase (priority 0.8)
  - All blog articles (priority 0.7)
- [ ] Create `/app/robots.ts`:
  - Allow all marketing pages
  - Disallow /api/*, /member/*, /admin/*, /book/*
  - Sitemap URL reference
- [ ] Create `/components/seo/` directory:
  - `OrganizationSchema.tsx` (used in root layout)
  - `LodgingBusinessSchema.tsx` (homepage)
  - `PropertySchema.tsx` (property pages)
  - `BreadcrumbSchema.tsx` (interior pages)
  - `FAQSchema.tsx` (FAQ sections)
  - `ReviewSchema.tsx` (property reviews)
- [ ] Create `/app/not-found.tsx` (custom 404)
- [ ] Create `/app/error.tsx` (custom error boundary)
- [ ] Add Google Search Console verification meta tag
- [ ] Add Google Analytics 4 via `next/script`
- [ ] Add PostHog initialization (EU region for GDPR)

### 1.3 Homepage (`/app/(marketing)/page.tsx`)

- [ ] SSG rendering (no client-only logic)
- [ ] Metadata:
  - Title: "AVEXA STAYS — Premium Apartments in Bucharest City Center"
  - Description: "Premium short-term apartments in Bucharest city center. Digital check-in, no front desk, hotel-grade quality. Book direct for the lowest guaranteed rate."
  - Canonical URL
  - Open Graph image (1200x630)
  - Twitter Card large
- [ ] H1: "Bucharest City Center, Unlocked."
- [ ] First paragraph contains primary keyword naturally
- [ ] Sections (per BRAND.md copy):
  - Hero with search form
  - Editorial cycling text
  - Locations preview
  - How it works (3 steps)
  - Member benefits preview
  - Footer
- [ ] All images via `next/image` with descriptive alt text
- [ ] Mobile responsive 360px to 1440px+
- [ ] Schemas embedded:
  - Organization (root layout, all pages)
  - LodgingBusiness (homepage specific)
  - FAQPage (if FAQ section added)

### 1.4 Locations Overview (`/app/(marketing)/locations/page.tsx`)

- [ ] SSG rendering
- [ ] Metadata with keyword "Bucharest neighborhoods"
- [ ] H1 with primary keyword
- [ ] Section title: "Location isn't everything. Until it is."
- [ ] 4 neighborhood cards (Calea Victoriei, Universitate, Old Town, Piața Romană)
- [ ] Each card links to `/locations/[slug]`
- [ ] BreadcrumbList schema
- [ ] LocalBusiness schema per neighborhood

### 1.5 Location Detail Pages (`/app/(marketing)/locations/[slug]/page.tsx`)

- [ ] SSG with `generateStaticParams`
- [ ] `generateMetadata` per location
- [ ] 800+ words unique content per location
- [ ] Embedded Google Map
- [ ] List of properties in that neighborhood
- [ ] Local attractions and transit info
- [ ] BreadcrumbList schema
- [ ] Place + TouristAttraction schema

### 1.6 Member Benefits Page (`/app/(marketing)/member-benefits/page.tsx`)

- [ ] SSG rendering
- [ ] H1: "The best rate is yours."
- [ ] Sections per BRAND.md:
  - Hero stat block
  - "No tiers. No catch." statement
  - 6 benefits cards
  - Loyalty reward (3 trips = 10% more)
  - Guest vs Member comparison table
  - Joining is instant (3 steps)
  - FAQ section
  - Final CTA
- [ ] FAQPage schema
- [ ] CTA buttons trigger signup flow

### 1.7 Technical SEO Foundation

- [ ] HTTPS enforced ✅ (via Vercel)
- [ ] HSTS header in `next.config.ts`
- [ ] Security headers (CSP, X-Frame-Options, Referrer-Policy)
- [ ] Mobile-first design
- [ ] Image optimization via `next/image` (WebP/AVIF auto)
- [ ] Font optimization via `next/font/google` (preload critical fonts)
- [ ] Lazy loading below-fold images
- [ ] Preconnect to critical domains (fonts.googleapis.com, etc.)
- [ ] No render-blocking resources
- [ ] LCP target: < 2.5s
- [ ] CLS target: < 0.1
- [ ] INP target: < 200ms

### 1.8 Google Search Console Setup

- [ ] Property verification via DNS TXT
- [ ] Sitemap submitted: `avexastays.com/sitemap.xml`
- [ ] Email alerts to hello@avexastays.com
- [ ] Performance monitoring enabled
- [ ] Manual URL inspection for homepage

### 1.9 Analytics Setup

- [ ] Google Analytics 4 property created
- [ ] GA4 measurement ID in env vars
- [ ] PostHog project created (EU region)
- [ ] Track conversion events:
  - `page_view` (automatic)
  - `search_initiated`
  - `property_viewed`
  - `booking_started`
  - `booking_completed`
  - `newsletter_signup`
  - `member_signup`
- [ ] UTM parameter tracking
- [ ] Cookie consent banner (Romanian GDPR + EU)

### 1.10 Routing Switch (READY FOR LAUNCH)

- [ ] Verify all pages working on /app preview
- [ ] Update vercel.json: remove rewrite for /
- [ ] Coming soon goes to /coming-soon (or removed)
- [ ] New homepage becomes root /
- [ ] Test all redirects

---

## Phase 2 — Booking System (6 weeks)

**Goal:** Full booking flow from search to confirmation email.

### 2.1 Supabase Database

- [ ] Create tables per ARCHITECTURE.md:
  - `users` (extends auth.users)
  - `properties`
  - `availability`
  - `bookings`
  - `price_details`
- [ ] Create RLS policies:
  - bookings: users see only their own
  - properties: public read
  - availability: public read
- [ ] Create indexes for performance
- [ ] Generate TypeScript types: `pnpm db:types`

### 2.2 Hostaway Integration

- [ ] Create `/lib/hostaway/client.ts`
- [ ] Implement endpoints wrapper:
  - `GET /v1/listings`
  - `GET /v1/listings/{id}/calendar`
  - `POST /v1/listings/{id}/priceDetails`
  - `POST /v1/reservations`
- [ ] Implement rate limiting (60 req/min max)
- [ ] Error handling and retries

### 2.3 Sync System

- [ ] Create `/app/api/sync/hostaway/route.ts`
- [ ] Sync logic:
  - Fetch all listings
  - Fetch availability next 90 days
  - Fetch prices
  - Upsert into Supabase
- [ ] Vercel cron job (every 15 min)
- [ ] Logging and error reporting
- [ ] Manual trigger endpoint with Bearer auth

### 2.4 Property Pages

- [ ] `/app/properties/page.tsx` (browse all)
  - Filter by neighborhood, dates, guests
  - Grid layout with cards
  - Price "from €X" from Supabase cache
- [ ] `/app/properties/[slug]/page.tsx` (single)
  - ISR with revalidation every 15 min
  - Image gallery
  - Amenities list
  - Calendar component
  - Booking CTA
  - Property schema (JSON-LD)
  - Internal links to neighborhood + other properties
  - Reviews from Hostaway (when API supports)

### 2.5 Booking Flow

- [ ] `/app/book/[propertyId]/page.tsx`
- [ ] Date/guest validation
- [ ] Live Hostaway price check (not cached)
- [ ] Member discount applied if logged in
- [ ] Guest details form
- [ ] Stripe Checkout session creation
- [ ] Redirect to Stripe Checkout

### 2.6 Stripe Integration

- [ ] `/lib/stripe/client.ts`
- [ ] `/app/api/checkout/route.ts`:
  - Validate booking data
  - Create Stripe Checkout session
  - Store pending booking in Supabase
- [ ] `/app/api/webhooks/stripe/route.ts`:
  - Verify signature
  - Handle `checkout.session.completed`
  - Handle `payment_intent.succeeded`
  - Handle `payment_intent.payment_failed`
  - Create Hostaway reservation
  - Update booking status
  - Trigger confirmation email

### 2.7 Email Templates (Brevo)

- [ ] Booking confirmation
- [ ] Pre-arrival email (24h before with PIN code)
- [ ] Check-out reminder
- [ ] Welcome series for members
- [ ] Cancellation confirmation

### 2.8 Phase 2 SEO Additions

- [ ] Property pages added to sitemap dynamically
- [ ] Property schema validated on every property page
- [ ] Image alt text auto-generated from property data
- [ ] Internal linking strategy implemented
- [ ] Breadcrumbs on all property pages

---

## Phase 3 — Auth + Member Area (3 weeks)

**Goal:** Full authentication system and member dashboard.

### 3.1 Supabase Auth Setup

- [ ] Configure auth providers
- [ ] Setup Google OAuth credentials
- [ ] Email templates configured in Supabase
- [ ] Password reset flow
- [ ] Magic link option

### 3.2 Auth Pages

- [ ] `/app/(auth)/login/page.tsx`
- [ ] `/app/(auth)/signup/page.tsx`
- [ ] OAuth callback handlers
- [ ] `noindex` on auth pages

### 3.3 Member Dashboard

- [ ] `/app/(member)/my-trips/page.tsx`
  - List active bookings
  - List past trips
  - Quick rebook
- [ ] `/app/(member)/profile/page.tsx`
  - Edit personal info
  - Payment methods
  - Preferences
- [ ] Server-side auth checks
- [ ] `noindex` on member pages

### 3.4 Member-Specific Features

- [ ] 15% member rate display
- [ ] 7+ night discount auto-apply
- [ ] Loyalty tracking (trip count)
- [ ] 10% bonus after 3 trips
- [ ] Welcome package opt-in

---

## Phase 4 — Polish + Launch (2 weeks)

**Goal:** Production-ready site with all integrations live.

### 4.1 Performance Audit

- [ ] Lighthouse 95+ all pages
- [ ] PageSpeed Insights field data "Good"
- [ ] CrUX monitoring enabled
- [ ] Vercel Speed Insights enabled
- [ ] Real device testing (iPhone, Samsung)
- [ ] Bundle size analysis
- [ ] Lazy load all below-fold content

### 4.2 SEO QA

- [ ] Rich Results Test on every page template
- [ ] Schema.org validator clean
- [ ] No duplicate meta tags
- [ ] All images have alt text
- [ ] All internal links work (404 check)
- [ ] XML sitemap valid
- [ ] robots.txt correctly configured
- [ ] Mobile usability passes
- [ ] Canonical URLs on every page

### 4.3 Production Checklist

- [ ] All env vars in Vercel Production
- [ ] Stripe switched to LIVE mode
- [ ] Stripe webhooks configured for production URL
- [ ] Brevo sender domain verified
- [ ] Database backups configured
- [ ] Error monitoring (Sentry optional)
- [ ] Vercel Pro plan active (commercial use)
- [ ] Domain SSL active
- [ ] Cron jobs running

### 4.4 Launch Day

- [ ] Switch vercel.json: `/` → app instead of coming-soon
- [ ] Submit updated sitemap to Search Console
- [ ] Manual indexing requests for top pages
- [ ] Monitor error logs
- [ ] Monitor analytics
- [ ] Announce on social media

### 4.5 Off-Page SEO

- [ ] Google My Business profile (if applicable)
- [ ] Local citations consistent (Booking.com, Airbnb, TripAdvisor)
- [ ] Press release for launch
- [ ] Social media profiles complete with links back
- [ ] Outreach to Bucharest travel bloggers

---

## Phase 5 — Content + Growth (ongoing)

### 5.1 Blog/Guides

- [ ] `/app/(marketing)/guides/page.tsx`
- [ ] `/app/(marketing)/guides/[slug]/page.tsx`
- [ ] First 5 articles:
  - "Where to stay in Bucharest city center"
  - "Best Bucharest neighborhoods for business travel"
  - "Bucharest 3-day itinerary"
  - "Calea Victoriei complete guide"
  - "Old Town Bucharest survival guide"
- [ ] Article schema with author
- [ ] Internal links to properties
- [ ] Outbound links to authorities

### 5.2 Internationalization (Optional)

- [ ] hreflang setup en/ro
- [ ] Romanian translation
- [ ] /ro/ subpath routing

### 5.3 PWA Features

- [ ] Manifest.json
- [ ] Service worker
- [ ] Add to home screen
- [ ] Offline page

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-06 | Next.js 15 App Router | SSR mandatory for SEO + modern patterns |
| 2026-06-06 | Supabase over Firebase | PostgreSQL needed for complex date queries |
| 2026-06-06 | Hostaway as source of truth | Already have contract, full PMS features |
| 2026-06-06 | Supabase as cache layer | Performance + cost savings on Hostaway calls |
| 2026-06-06 | Stripe Checkout over Elements | Faster integration + compliance handled |
| 2026-06-06 | Brevo for emails | Already have account |
| 2026-06-06 | "No front desk. No friction. No compromise." | Differentiator vs NUMA |
| 2026-06-06 | "Bucharest City Center, Unlocked." H1 | Primary keyword + brand voice |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hostaway API rate limits | Medium | High | Cache via Supabase, 15min sync |
| Stripe webhook fails | Low | Critical | Idempotency + retry queue |
| SEO ranking takes longer than 6 months | Medium | Medium | Content strategy + outreach |
| Vercel costs exceed budget | Low | Medium | Monitor with budget alerts |
| Hostaway price/availability mismatch | Low | High | Live check before payment |
