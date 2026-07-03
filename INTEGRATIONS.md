# AVEXA — Integrations Setup

## Environment Variables — Complete List

All three environments (Production, Preview, Development) unless noted.

```bash
# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL=https://avexastays.com
NEXTAUTH_URL=https://avexastays.com

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...    # SERVER ONLY

# ============================================
# GOOGLE MAPS
# ============================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# ============================================
# STRIPE
# ============================================
# TEST mode (Preview + Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# LIVE mode (Production only — switch on launch)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...  (new for live endpoint)

# ============================================
# HOSTAWAY
# ============================================
HOSTAWAY_ACCOUNT_ID=xxxxxxx
HOSTAWAY_API_KEY=hosta_...
HOSTAWAY_WEBHOOK_SECRET=                  # openssl rand -hex 24 — Basic-auth password for /api/webhooks/hostaway (login "avexa"); set the same value when registering the unified webhook

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_SECRET=                          # openssl rand -base64 32
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# ============================================
# EMAIL MARKETING — RESEND AUDIENCES (newsletter)
# ============================================
# /api/newsletter adds contacts to a Resend Audience — same RESEND_API_KEY the
# refund notice already uses (existing account, no second subscription).
# Setup: Resend dashboard → Audiences → Create → copy the id below. Until the
# id is set, the form honestly answers 503 "Subscriptions open soon".
RESEND_AUDIENCE_ID=
# (Brevo was the earlier plan for campaigns — dropped for now; revisit only if
# real campaign tooling is ever needed.)

# ============================================
# ANALYTICS
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# ============================================
# INTERNAL SECURITY
# ============================================
SYNC_SECRET=                              # openssl rand -base64 32
CRON_SECRET=                              # openssl rand -base64 32
```

---

## Hostaway API

### Access
- **Dashboard:** app.hostaway.com
- **Settings → Hostaway API → Create API Key**
- **Partner selection:** "Hostaway Public API" (for custom integrations)
- **Account ID:** displayed at top of dashboard
- **API Key:** copy immediately after generation (shown once)

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/listings` | GET | List all properties |
| `/v1/listings/{id}` | GET | Single property details |
| `/v1/listings/{id}/calendar` | GET | Availability + prices for date range |
| `/v1/listings/{id}/priceDetails` | POST | Exact pricing for specific dates |
| `/v1/reservations` | POST | Create new reservation |
| `/v1/reservations/{id}` | GET | Reservation details |

### Rate Limits
- **60 requests per minute** maximum
- Implement exponential backoff on 429 responses
- Cache aggressively via Supabase

### Sync Schedule
- **Every 15 minutes** via Vercel Cron
- Manual trigger: `POST /api/sync/hostaway` with Bearer token

### Code Locations
```
/lib/hostaway/
  client.ts              Main API client
  endpoints.ts           Endpoint definitions
  types.ts               TypeScript types
  sync.ts                Sync logic to Supabase
  rate-limiter.ts        Token bucket rate limiter

/app/api/sync/hostaway/route.ts    Sync endpoint
/app/api/webhooks/hostaway/route.ts (if webhooks used)
```

---

## Stripe

### Account Setup
- **Dashboard:** dashboard.stripe.com
- **Business:** Register on client's company (Smighi)
- **Bank account:** Client's company bank
- **Mode:** TEST until launch day, then switch to LIVE

### API Keys
1. Dashboard → Developers → API Keys
2. Copy Publishable key (pk_test_...) → frontend
3. Copy Secret key (sk_test_...) → backend only

### Webhook Setup

**Dashboard → Developers → Webhooks → Add endpoint**

**URL:** `https://avexastays.com/api/webhooks/stripe`

**Events to listen for:**
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.deleted` (if subscriptions added later)

**After creating:** copy Signing secret (whsec_...) → STRIPE_WEBHOOK_SECRET

### Payment Methods to Enable
- Card (Visa, Mastercard, Amex)
- Apple Pay
- Google Pay
- SEPA Direct Debit (for EU)
- Klarna (Pay Later)
- Link by Stripe

### Code Locations
```
/lib/stripe/
  client.ts              Stripe SDK initialization
  checkout.ts            Create Checkout sessions
  webhooks.ts            Webhook handlers per event
  types.ts               TypeScript types

/app/api/checkout/route.ts          Create checkout session
/app/api/webhooks/stripe/route.ts   Process webhooks
```

### Switch to Live Mode (Launch Day)
1. Dashboard → toggle "Viewing test data" → off
2. Get new pk_live_ and sk_live_ keys
3. Create new webhook endpoint for production URL
4. Get new whsec_ for production
5. Update Vercel env vars (Production only):
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → pk_live_...
   - `STRIPE_SECRET_KEY` → sk_live_...
   - `STRIPE_WEBHOOK_SECRET` → new whsec_...
6. Test with real card for €1, then refund

---

## Supabase

### Project Setup
- **Dashboard:** supabase.com → Project "AVEXA Stays"
- **Region:** Frankfurt (eu-central-1) for GDPR + latency
- **Plan:** Free during development, Pro ($25/mo) when live
- **Owner:** Client (Smighi)
- **Admin:** Robert (bertirfi)

### API Keys
Dashboard → Settings → API
- **Project URL:** https://xxxxx.supabase.co
- **anon key:** safe for frontend, used for public reads
- **service_role key:** server-only, bypasses RLS

### Database

See **ARCHITECTURE.md** for complete schema. Main tables:
- `profiles` (extends auth.users)
- `properties` (Hostaway cache)
- `availability` (date-by-date inventory)
- `bookings` (user bookings)

### Authentication

**Providers to enable (Authentication → Providers):**
- Email (magic link)
- Google OAuth
- Apple (Phase 5+)

**Email templates (Authentication → Email Templates):**
- Confirmation
- Magic link
- Password reset
- Email change
- Customize with AVEXA branding

### Row Level Security (RLS)

**MUST enable on every table** before going to production. See ARCHITECTURE.md for policies.

### Code Locations
```
/lib/supabase/
  server.ts              Server client (with cookies)
  browser.ts             Browser client (anonymous)
  middleware.ts          Middleware client (auth checks)
  types.ts               Generated types from schema
  queries/               Reusable queries

/db/
  schema.sql             Master schema
  migrations/            Versioned migrations
  seed.sql               Test data
```

---

## Google Maps

### APIs Enabled (Google Cloud Console)
- **Maps JavaScript API** — interactive map on locations + property pages
- **Places API (New)** — autocomplete in search, place details
- **Geocoding API** — address → lat/lng conversion

⚠️ Use **Places API (New)**, NOT legacy Places API.

### API Key Restrictions
**Application restrictions:** HTTP referrers
- `avexastays.com/*`
- `*.avexastays.com/*`
- `avexa-stays.vercel.app/*`
- `localhost/*`
- `localhost:3000/*`

**API restrictions:** Limit to 3 APIs above

### Billing
- $300 free trial / 90 days
- $50/month budget alert configured (50% / 90% / 100%)
- Likely cost at scale: $50-100/month

### Code Locations
```
/lib/maps/
  loader.ts              Google Maps JS API loader
  geocoding.ts           Geocoding wrapper
  places.ts              Places autocomplete

/components/
  Map.tsx                Interactive map component
  SearchAutocomplete.tsx Place search input
```

---

## Brevo (Email)

### Account
- **Dashboard:** app.brevo.com
- **Existing account** — already has API key

### Setup
1. **Sender domain verification:** Add avexastays.com SPF + DKIM
2. **Sender email:** bookings@avexastays.com (verified)
3. **Templates** designed in Brevo dashboard

### API Key
- Dashboard → SMTP & API → API Keys
- Generate v3 API key

### Email Templates (To Create)

| Template | Trigger | Variables |
|----------|---------|-----------|
| Booking Confirmation | Stripe webhook success | guest_name, property_name, check_in, check_out, total_price |
| Pre-Arrival (24h) | Cron job 24h before check_in | guest_name, property_name, pin_code, address, access_instructions |
| Check-out Reminder | Cron job morning of check_out | guest_name, property_name, check_out_time |
| Member Welcome | After signup | full_name, member_benefits_url |
| Cancellation | After cancellation | guest_name, booking_ref, refund_amount |
| Newsletter Welcome | Newsletter signup | first_name |

### Code Locations
```
/lib/email/
  brevo.ts               Brevo SDK wrapper
  templates.ts           Template IDs mapping
  sender.ts              Email send functions
  types.ts               TypeScript types
```

---

## Google Analytics 4

### Setup
1. Go to analytics.google.com
2. Create new property "AVEXA STAYS"
3. Region: Europe
4. Get Measurement ID: G-XXXXXXXXXX

### Implementation
```typescript
// /app/layout.tsx
import Script from 'next/script'

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="ga4" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `}
</Script>
```

### Custom Events to Track
- `search` (when user searches)
- `view_item` (property page view)
- `add_to_cart` (booking started)
- `begin_checkout` (Stripe Checkout opened)
- `purchase` (booking confirmed)
- `sign_up` (newsletter or member)
- `login` (member login)

---

## PostHog

### Setup
- **Region:** EU Cloud (eu.i.posthog.com) for GDPR
- **Project:** AVEXA
- **Project API Key:** for frontend
- **Personal API Key:** for backend (rarely needed)

### Features to Enable
- **Session recordings** (sampled at 10% to save quota)
- **Heatmaps** (auto-collected)
- **Feature flags** (for A/B tests)
- **Funnels** (booking conversion)

### Implementation
```typescript
// /lib/analytics/posthog.ts
import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  })
}
```

---

## Google Search Console

### Setup
1. Go to search.google.com/search-console
2. Add property: avexastays.com
3. Verify via DNS TXT (record already exists from Google Workspace)
4. Submit sitemap: avexastays.com/sitemap.xml
5. Configure email alerts

### Reports to Monitor
- Performance (clicks, impressions, position)
- Coverage (indexed vs errors)
- Sitemaps (submitted vs indexed)
- Mobile usability
- Core Web Vitals
- Manual actions (penalties)

---

## Vercel

### Project Setup
- **Team:** berti8 (team_IwbikVFoTRMhZdgqDofLYPp2)
- **Project ID:** prj_vIIvho5f7ZqBTlF1yul16V8dySrx
- **Plan:** Hobby for dev → Pro ($20/mo) when live (REQUIRED for commercial use + Cron Jobs)

### Environment Variables
Settings → Environment Variables → add each variable for:
- Production (live keys)
- Preview (test keys)
- Development (test keys)

### Cron Jobs (Pro plan required)
`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sync/hostaway",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/pre-arrival-emails",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/cleanup-pending-bookings",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### Auto-Deploys
- `main` branch → production
- Feature branches → preview URLs
- PR comments include preview links

### Domains
- avexastays.com (primary)
- www.avexastays.com (redirect to apex)
- avexa-stays.vercel.app (Vercel default)

---

## Domain & DNS

- **Registrar:** Hostico (domain only)
- **DNS:** Vercel nameservers
  - ns1.vercel-dns.com
  - ns2.vercel-dns.com

### Records Configured
- MX records (Google Workspace × 5)
- TXT google-site-verification
- TXT DKIM (google._domainkey)
- A/CNAME for avexastays.com → Vercel
- CNAME for www → Vercel

---

## Setup Order (Recommended Sequence)

1. ✅ Domain + DNS (done)
2. ✅ Vercel project (done)
3. ✅ Google Workspace email (done)
4. ✅ Supabase organization (done)
5. ✅ Google Maps API (done)
6. ⏳ Stripe account + test mode keys
7. ⏳ Hostaway API access
8. ⏳ Brevo sender domain verification
9. ⏳ Google Search Console verification
10. ⏳ Google Analytics 4 property
11. ⏳ PostHog project
12. ⏳ Google OAuth credentials (Cloud Console)
13. ⏳ Generate NEXTAUTH_SECRET, SYNC_SECRET, CRON_SECRET
14. ⏳ All env vars added to Vercel
15. ⏳ First Next.js deployment
