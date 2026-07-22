# AVEXA — Architecture

## High-Level Overview

```
┌────────────────────────────────────────────────────┐
│  USERS (Web + Mobile)                              │
└─────────────────┬──────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼──────────────────────────────────┐
│  VERCEL EDGE NETWORK                               │
│  - CDN caching                                     │
│  - Auto SSL                                        │
│  - DDoS protection                                 │
└─────────────────┬──────────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────────┐
│  NEXT.JS 15 APP (App Router)                       │
│  ├─ Marketing pages (SSG)                          │
│  ├─ Property pages (ISR, 15min revalidate)         │
│  ├─ Booking flow (SSR)                             │
│  ├─ Member dashboard (SSR, protected)              │
│  └─ API routes + webhooks                          │
└─────┬───────────┬─────────────┬────────────────────┘
      │           │             │
      ▼           ▼             ▼
┌──────────┐ ┌─────────┐  ┌───────────────┐
│ SUPABASE │ │ STRIPE  │  │ HOSTAWAY API  │
│ (cache + │ │ Payments│  │ (source of    │
│  auth)   │ │         │  │  truth)       │
└──────────┘ └─────────┘  └───────────────┘
      ▲                          │
      │   Every 15 min sync      │
      └──────────────────────────┘
              (Vercel Cron)
```

---

## Rendering Strategy (SEO-First)

| Route Type | Strategy | Why |
|------------|----------|-----|
| Marketing pages (/, /locations, /member-benefits) | SSG | Maximum speed, perfect SEO |
| Property listings (/properties) | ISR (15min) | Fresh data + speed |
| Property detail (/properties/[slug]) | ISR + on-demand revalidate | Updates when Hostaway syncs |
| Location detail (/locations/[slug]) | SSG | Content rarely changes |
| Booking flow (/book/...) | SSR | User-specific, no cache |
| Member dashboard (/my-trips) | SSR | Auth-protected, dynamic |
| API routes | Dynamic | Server-only logic |

---

## Data Flow

### Booking Creation (Critical Path)

```
1. User selects dates on property page
   → Frontend reads availability from Supabase

2. User clicks "Book Now"
   → POST /api/checkout
   → API validates dates available (Supabase)
   → API calls Hostaway LIVE price check
   → API creates pending booking in Supabase
   → API creates Stripe Checkout session
   → API returns session URL

3. User redirected to Stripe Checkout
   → Pays with card/Apple Pay/Google Pay

4. Stripe webhook fires
   → POST /api/webhooks/stripe
   → Verify signature
   → Handle checkout.session.completed:
     a. Create Hostaway reservation
     b. Update Supabase booking → confirmed
     c. Send confirmation email via Brevo

5. User redirected to /booking/success
   → Display confirmation
   → Show check-in details
```

### Hostaway → Supabase Sync (Every 15 min)

```
Vercel Cron triggers POST /api/sync/hostaway
  → API authenticates request (Bearer token)
  → API fetches:
    - All active listings
    - Calendar for next 90 days
    - Current prices
  → API upserts into Supabase:
    - properties table
    - availability table
    - rates table
  → API logs sync status
```

### Auth Flow

```
1. User clicks "Sign in"
   → Supabase Auth UI opens

2. User chooses method:
   - Email magic link
   - Google OAuth
   - (Future: Apple Sign In)

3. After auth:
   → JWT stored in httpOnly cookie
   → User redirected to /my-trips
   → RLS protects user-specific queries
```

---

## Database Schema

### auth.users (Supabase managed)
- id (uuid, PK)
- email
- email_confirmed_at
- created_at
- updated_at

### public.profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  marketing_consent BOOLEAN DEFAULT false,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### public.properties
```sql
CREATE TABLE properties (
  id TEXT PRIMARY KEY,              -- Hostaway listing ID
  slug TEXT UNIQUE NOT NULL,        -- SEO-friendly URL
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  description TEXT,                  -- 200+ word unique
  price_from DECIMAL(10, 2),         -- "from €X" display
  max_guests INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities JSONB,                   -- ["wifi", "kitchen", ...]
  images JSONB,                      -- [{ url, alt, order }]
  active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_active ON properties(active);
```

### public.availability
```sql
CREATE TABLE availability (
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  min_stay INTEGER DEFAULT 1,
  PRIMARY KEY (property_id, date)
);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_available ON availability(available);
```

### public.bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  property_id TEXT REFERENCES properties(id),
  hostaway_reservation_id TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  subtotal DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL,              -- pending, confirmed, cancelled
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  guest_email TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  member_discount_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Row Level Security (RLS)

```sql
-- Properties: public read
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are publicly readable"
  ON properties FOR SELECT
  USING (active = true);

-- Availability: public read
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability is publicly readable"
  ON availability FOR SELECT
  USING (true);

-- Bookings: users see only their own
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Profiles: users manage their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## API Routes

### Public (no auth required)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/properties` | GET | List active properties (paginated) |
| `/api/properties/[id]` | GET | Single property details |
| `/api/availability/[id]` | GET | Calendar for property |
| `/api/checkout` | POST | Create Stripe Checkout session |
| `/api/newsletter` | POST | Subscribe to Brevo |

### Authenticated

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/me/bookings` | GET | User's bookings |
| `/api/me/profile` | GET/PATCH | User profile |
| `/api/me/preferences` | PATCH | Update preferences |

### Webhooks (signature verified, no auth)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/stripe` | POST | Stripe events |
| `/api/webhooks/hostaway` | POST | Hostaway events (if used) |

### Internal (Bearer token)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sync/hostaway` | POST | Trigger Hostaway sync |
| `/api/cron/cleanup` | POST | Cleanup expired pending bookings |

---

## SEO Architecture

### URL Structure

```
/                                    Homepage
/locations                           Locations overview
/locations/calea-victoriei           Location detail
/locations/universitate
/locations/old-town
/locations/piata-romana

/properties                          Browse all
/properties/luxury-2br-calea-victoriei-302   Property detail

/member-benefits                     Member club page
/guides                              Blog overview
/guides/where-to-stay-bucharest      Article

/about
/contact
/terms
/privacy

/book/[propertyId]                   Booking flow (noindex)
/login                               Auth (noindex)
/signup                              Auth (noindex)
/my-trips                            Member only (noindex)
```

### Metadata Strategy

- **Root layout:** `metadataBase`, default OG image, Twitter card defaults, theme color
- **Section layouts:** Section-specific overrides
- **Page-level:** `generateMetadata` with fully unique content per route

### Structured Data Components

| Component | Used on |
|-----------|---------|
| `OrganizationSchema` | Root layout (all pages) |
| `LodgingBusinessSchema` | Homepage, locations |
| `PropertySchema` (Apartment type) | Property detail pages |
| `BreadcrumbSchema` | All interior pages |
| `FAQSchema` | Member benefits, FAQs |
| `ReviewSchema` | Property reviews |
| `LocalBusinessSchema` | Location detail pages |
| `ArticleSchema` | Blog articles |

### Sitemap Strategy

`/app/sitemap.ts` auto-generates from:
- Static pages list (hardcoded)
- All active properties from Supabase
- All location pages
- All blog articles

**Priority:**
- Homepage: 1.0
- Locations overview: 0.9
- Location detail: 0.85
- Property detail: 0.8
- Member benefits: 0.7
- Guides: 0.6

**changeFrequency:**
- weekly for properties (prices/availability)
- monthly for marketing pages
- daily for /properties browse page

### Robots Strategy

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /member/
Disallow: /admin/
Disallow: /book/
Disallow: /login
Disallow: /signup

Sitemap: https://avexastays.com/sitemap.xml
```

### International SEO (Phase 5)

- Default: en (English)
- Add: ro (Romanian) for local audience
- hreflang annotations on all dual-language pages
- /ro/ subpath routing

---

## Performance Strategy

### Critical Path Optimization

- **Above-fold:** Inline critical CSS, preload hero image
- **Fonts:** `next/font/google` with `display: swap` and preload
- **Images:** `next/image` with priority for above-fold, lazy for below
- **JS:** Code split per route automatically by Next.js
- **Third-party scripts:** Lazy load with `strategy="lazyOnload"`

### Caching Strategy

| Resource | Cache | TTL |
|----------|-------|-----|
| Static assets | Edge | 1 year |
| HTML (SSG) | Edge | 1 hour, revalidate |
| HTML (ISR) | Edge | 15 min |
| API GET | Vercel Edge | 1 min |
| API POST | None | - |
| Images | Edge + CDN | 1 year |

### Bundle Size Targets

- Initial JS bundle: < 100KB gzipped
- Total page weight: < 500KB above-fold
- Time to Interactive: < 3s on 4G

---

## Security

### Headers (next.config.ts)

```typescript
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
  }
]
```

### Authentication Security

- HttpOnly cookies for session tokens
- SameSite=Lax
- Secure flag (HTTPS only)
- CSRF tokens for state-changing forms
- Rate limiting on auth endpoints (5 attempts / 15min)

### Payment Security

- Stripe Checkout (PCI compliance handled by Stripe)
- Webhook signature verification
- Idempotency keys on critical operations
- No card details ever touch our servers

### Data Protection (GDPR)

- Cookie consent banner (granular)
- Data export endpoint for users
- Account deletion endpoint
- Privacy policy + Terms of service pages
- Marketing consent separate from terms acceptance

---

## Monitoring

- **Errors:** Vercel logs + optional Sentry
- **Performance:** Vercel Speed Insights + CrUX
- **Analytics:** GA4 + PostHog
- **Uptime:** Vercel built-in
- **Database:** Supabase dashboard
- **Payments:** Stripe dashboard
- **Search:** Google Search Console
