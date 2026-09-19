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
# AVEXA AUTOMATION (CRM) — see ## AVEXA Automation (CRM)
# ============================================
MYTRIPS_API_SECRET=                       # same value in the guest-crm Vercel project; server-only

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_SECRET=                          # openssl rand -base64 32
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# ============================================
# EMAIL — BREVO (transactional + newsletter)
# ============================================
# lib/email/brevo.ts sends the booking receipt, the refund notice, the
# cancellation notice and the ops alert; /api/newsletter adds contacts to a
# Brevo list. Auth emails (magic link, confirm, reset) go through Supabase
# SMTP, pointed at Brevo SMTP (smtp-relay.brevo.com:587, login = Brevo SMTP
# key) in the Supabase dashboard → Authentication → SMTP Settings.
# The confirmation + check-in-link email for DIRECT reservations is sent by the
# CRM (AVEXA Automation) since 19.09.2026 — not by the site.
# Setup: Brevo → Contacts → Lists → create → copy the numeric id below. Until
# it is set, the form honestly answers 503 "Subscriptions open soon".
BREVO_LIST_ID=
# (Resend is gone: no code, no env vars, and its DNS records must be deleted.)

# ============================================
# ANALYTICS
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_...          # the only analytics switch — see ## PostHog

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
1. **Sender email:** office@avexastays.com — "Prime Gold Living SRL" (verified in Brevo). Override with `BREVO_SENDER_NAME` / `BREVO_SENDER_EMAIL`.
2. **Templates live in code** (`lib/email/brevo.ts`), not in the Brevo dashboard.
3. **Domain authentication (deliverability) — required, checked 19.09.2026: NOT done yet.** avexastays.com had no SPF, no Brevo DKIM and no DMARC, so office@ mail (Brevo *and* Google Workspace) can land in spam. DNS is on Vercel (Vercel → Domains → avexastays.com → DNS Records). First **delete the two leftover Resend records on `send`** (TXT + MX) — a name with a CNAME cannot hold other records. Then add (empty Name = root):

   | Name | Type | Value |
   |------|------|-------|
   | (empty) | TXT | the `brevo-code` value from Brevo → Senders, Domains & Dedicated IPs → Domains → Authenticate |
   | (empty) | TXT | `v=spf1 include:_spf.google.com include:spf.brevo.com ~all` (one SPF record only — covers Gmail office@ and Brevo) |
   | `brevo1._domainkey` | CNAME | `b1.avexastays-com.dkim.brevo.com` |
   | `brevo2._domainkey` | CNAME | `b2.avexastays-com.dkim.brevo.com` |
   | `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` (Brevo aggregates the reports; move to `p=quarantine` after 1–2 clean weeks) |
   | `send` | CNAME | `send-avexastays-com.brand.brevosend.com` |
   | `r.send` | CNAME | `send-avexastays-com.r.brand.brevosend.com` |
   | `img.send` | CNAME | `send-avexastays-com.img.brand.brevosend.com` |

   Done when Brevo shows the domain as Authenticated and the sender's DKIM is no longer "Default". Google's sender guidelines (2024+) require SPF + DKIM with alignment; the Brevo custom DKIM provides it. Only after that: point Supabase SMTP at Brevo (above).
4. **Who emails the guest at booking (since 19.09.2026):**
   - **CRM (AVEXA Automation):** direct reservations (site / phone) get ONE email from office@ via Brevo — confirmation + check-in link, template editable in Check-in Admin → Settings → "Email rezervări directe". OTA reservations get only the channel chat message. Pre-arrival instructions: email + SMS from the CRM.
   - **Site:** the booking receipt (dates, price breakdown, extras, cancellation terms — data only the site has), the refund/conflict notice, the cancellation notice and the internal ops alert. The site no longer sends any check-in-link email (`lib/hostaway/confirmation.ts` removed).
   - **Hostaway:** in Inbox → Message Automations, untick *Direct* / *Website* channels on every "new reservation / confirmed" automation; at CRM go-live switch off the automations carrying the ChargeAutomation link on all channels.

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

## AVEXA Automation (CRM)

### What it does on the site
- **My Trips → „Check-in & access” card** on every confirmed, not-yet-checked-out stay: the online check-in link → „Check-in completed” + when the code will show → the door code, address and validity → hidden after check-out or for cancelled reservations. The site shows exactly what the CRM returns; it derives nothing.
- **Check-in email:** sent by the CRM itself for direct reservations (since 19.09.2026). The site sends none; `lib/hostaway/confirmation.ts` and `getCrmCheckinUrl` were removed.

### Wiring
- `lib/crm/trip.ts` — `GET https://crm.avexastays.com/api/public/trip?reservation=<hostaway_reservation_id>`, `Authorization: Bearer MYTRIPS_API_SECRET`, `cache: 'no-store'`, 5 s timeout, Zod-validated. Server-only (server component + webhook); never from the browser.
- Result mapping (`app/(member)/my-trips/page.tsx` → `toCheckin`): 404 = „will appear here shortly”; `active=false` = no card; `access.available` + `code` = the code; `checkin.completed` = tick + `available_from` (Bucharest time); otherwise the link button. 401/500/timeout/bad payload = card hidden + `console.error`.
- One call per upcoming stay, in parallel, on every My Trips render (the CRM answers no-store by design).
- Env: `MYTRIPS_API_SECRET` — same value in both Vercel projects (guest-crm + avexa-stays), Production → redeploy both. Unset = integration off (card hidden, email uses the CA fallback).
- Quick test: `curl -H "Authorization: Bearer $MYTRIPS_API_SECRET" "https://crm.avexastays.com/api/public/trip?reservation=<real hostaway id>"`.

Spec: Google Doc „Integrare My Trips ↔ CRM (AVEXA Automation)” (15.09.2026).

---

## PostHog

### Setup
- **Project:** EU Cloud, org „Avexa Stays” → „Default project” (id `242490`) — https://eu.posthog.com/project/242490
- **Env:** `NEXT_PUBLIC_POSTHOG_KEY` = project token (`phc_…`, public, ships in the browser). It is the ONLY switch: unset → no analytics category, no SDK, no requests. Vercel Preview/Production + **redeploy** (NEXT_PUBLIC_* is inlined at build).
- **Disclosure:** Cookie Policy AVX-07 **v3.3** (`content/legal/cookies-v3-3.tsx` §6, in force 14 Sept 2026, live at /cookies; v3.2 archived at /cookies/v3-2). Written on the site first by Robert's decision — Vlad's Drive copy of AVX-07 must be brought in line. Any change to what PostHog collects (retention, replay masking, new properties) = a new policy version, not an edit of v3.3.
- **Project settings (already on in PostHog):** session replay (inputs masked, 30-day retention), heatmaps, dead clicks, exception autocapture, web vitals, IPs discarded (`anonymize_ips`). Console logs in replays are switched off in code (`enable_recording_console_log: false`).

### How it's wired
- `lib/analytics.ts` — `track()`, `captureError()`, `syncIdentity()`, `setAnalyticsConsent()`. `posthog-js` (~94 KB gz) is `import()`ed ONLY after Analytics consent; calls made earlier are queued, dropped on denial.
- `components/consent/AnalyticsGate.tsx` (root layout) — consent → load / `opt_out_capturing()`; Supabase session → `identify(user.id)` / `reset()`. No email or name is ever sent.
- Consent: `CONSENT_VERSION` is 2 when the key is set (every visitor re-asked); withdrawal from „Cookie preferences” wipes the `ph_*` cookie + localStorage and stops the recorder; a lapsed or refused consent deletes any PostHog ids left on the device. PostHog cookie lifetime = 180 days (same as the consent).
- Proxy: `middleware.ts` proxies `/lumen/*` → `eu.i.posthog.com` / `eu-assets.i.posthog.com` with the `cookie` and `authorization` headers **deleted** (blockers skip our own origin). Never move it back to `next.config` rewrites: a rewrite forwards the visitor's cookies — the Supabase session with tokens, email and name — to PostHog. `skipTrailingSlashRedirect` is on for PostHog's `/e/` endpoints, so the middleware keeps the `/x/ → /x` 308 for pages.
- Privacy: `?session_id=` (bearer link to a guest booking) and `?code=` are masked in every URL, replays included; /book/confirmation sends `Referrer-Policy: strict-origin` (PostHog does not mask `$referrer`); `mask_all_text` keeps element text out of click events; member-only text sits in `ph-mask` elements (Nav account menu, My Trips, Profile, sign-up confirmation email, invoice company name). Don't set `session_recording.maskTextSelector` in code — it overrides the project's masking settings.
- Errors: `app/error.tsx` → `captureError` (React error boundaries hide errors from autocapture).
- Testing: headless browsers (gstack browse) are dropped by PostHog's bot filter — verify events from a real browser with `?__posthog_debug=true`; localhost events are flagged as internal.

### Custom events
| Event | Fired in | Properties |
|---|---|---|
| `search_submitted` | `SearchPill` / `MobileSearchOverlay` | surface, area, check_in, check_out, nights, guests |
| `booking_started` | `StayBookingSidebar` → /checkout | property, check_in, check_out, nights, guests, logged_in |
| `payment_started` | `PaymentStep`, before the Stripe redirect | property, check_in, nights, guests, guest_checkout, extras_count, revenue, currency |
| `booking_confirmed` | /book/confirmation (only while that stay's draft exists — first landing from Stripe) | revenue (RON), currency, property, check_in, nights, guests, rate_plan, guest_checkout, extras_count, display_currency |
| `booking_cancelled` | `CancelTripButton` | refund_percent |
| `newsletter_subscribed` | footer form | source |
| `user_signed_up` / `user_logged_in` | `LoginForm` (password) | method |

`guests` = adults + children everywhere (same as `bookings.guests`). Autocaptured on top: `$pageview`/`$pageleave` (SPA history), clicks, rage/dead clicks, `$exception`, `$web_vitals`, replays, heatmaps.

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
11. ✅ PostHog project (EU, id 242490) — code + Cookie Policy v3.3 ready; Production key = `NEXT_PUBLIC_POSTHOG_KEY` in Vercel + redeploy
12. ⏳ Google OAuth credentials (Cloud Console)
13. ⏳ Generate NEXTAUTH_SECRET, SYNC_SECRET, CRON_SECRET
14. ⏳ All env vars added to Vercel
15. ⏳ First Next.js deployment
