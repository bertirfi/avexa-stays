# AVEXA STAYS — Brand System

## Brand Promise

> The privacy of a residence. The precision of a five-star hotel.

AVEXA stands for: **No front desk. No friction. No compromise.**

---

## Brand Mottos

**The Experience:**
> *Arrive. Unlock. Live.*

**The Standard:**
> *No front desk. No friction. No compromise.*

**The Feeling:**
> *The city, on your terms.*

---

## Voice & Tone

| Attribute | What it means |
|-----------|---------------|
| **Confident** | We state, not ask. "Bucharest, Unlocked." not "Maybe try Bucharest?" |
| **Editorial** | Newspaper-style headlines. Paradoxes. Short and long sentences mixed. |
| **Direct** | Skip the platforms. Reserve in 90 seconds. No tiers. No catch. |
| **Warm but precise** | Premium without being cold. Refined without being snobbish. |
| **Urban** | Modern, fast-paced, traveler-aware |

**Voice rules:**
- Never use "we're excited" or "amazing"
- Avoid superlatives unless quantified (4.98/5, not "best ever")
- Cut words. Then cut more.
- Show, don't tell. "Lights calibrated. Linens pressed." not "We prepare your space perfectly."

---

## Colors (CSS Variables)

> Source of truth: `app/globals.css` (Tailwind v4 `@theme` block). Tokens are
> defined as `--color-*` and consumed via Tailwind utilities (`bg-ink`,
> `text-gold`, `border-gray-line`, ...).

```css
--color-ink: #191919          /* Primary text + dark backgrounds */
--color-ink-80: rgba(25,25,25,0.82)   /* Body text on light */
--color-ink-60: rgba(25,25,25,0.6)    /* Muted/secondary text */

--color-gold: #DDB97A         /* Primary accent — Soft Gold C */
--color-gold-dark: #B08840    /* Hover/active states, icon accents */
--color-gold-pale: #F7EDDB    /* Subtle gold backgrounds, selections */

--color-cream: #FAF9F5        /* Default page background */
--color-gray-light: #F1F1F1   /* Skeletons, input backgrounds */
--color-gray-line: #E6E4DD    /* Borders, dividers */

/* Neighborhood accents (cards/map pins) */
--color-nbh-floreasca: #FF4136
--color-nbh-pipera: #D4531A
--color-nbh-centre: #2E7D32
--color-nbh-dorobanti: #1565C0
--color-nbh-herastrau: #6A1B9A
--color-nbh-baneasa: #00695C
```

There is **no `--white` token** — plain white uses Tailwind's `white`/`bg-white`.

**Known drift (normalize during Phase 5 polish):** components hardcode
near-token values that should be replaced with tokens — `#0f0f0f`/`#1a1a1a`
(vs ink) in Hero/LoginForm/MemberHero gradients; three different gold RGBA
approximations (`221,185,122` / `201,160,94` / `176,136,64`) in gradient
strings; one-off darks `#14110d` (LocationsCarousel), `#242824`/`#2e332d`
(StylizedMap); status colors `#2E7D32` (TripsList), `#FF4136` (ProfileApp
danger), `#25D366` (WhatsApp).

---

## Typography

> Source of truth: `lib/fonts.ts` (next/font/google) + utilities in
> `app/globals.css`.

**Display:** Plus Jakarta Sans — weights loaded: 500 / 700 / 800
- Utility `.font-display`: weight 800, letter-spacing -0.02em, line-height 0.96
- Use for H1, H2, large numbers, stats

**Body:** Manrope — weights loaded: 300 / 400 / 500 / 600 / 700
- `body` default: **weight 400**, line-height 1.72 (300 is loaded but not the default)
- Use for paragraphs, descriptions

**Mono/Labels:** DM Mono — weights loaded: 400 / 500
- Utility `.font-mono-label`: weight 500, **font-size 10px**, letter-spacing 0.2em, uppercase
- Use for: section labels (eyebrows), dates, metadata
- CSS variable is `--font-dm-mono` (mapped to `--font-mono` family token in `@theme`)

**Loading (actual code, `lib/fonts.ts`):**
```typescript
import { Plus_Jakarta_Sans, Manrope, DM_Mono } from 'next/font/google';

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'], weight: ['500', '700', '800'],
  variable: '--font-jakarta', display: 'swap',
});
export const manrope = Manrope({
  subsets: ['latin'], weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope', display: 'swap',
});
export const dmMono = DM_Mono({
  subsets: ['latin'], weight: ['400', '500'],
  variable: '--font-dm-mono', display: 'swap',
});
```

**Heading scale in practice:** large display headings use fluid
`clamp()` values (e.g. hero `clamp(36px,6vw,52px)`, member hero
`clamp(56px,10vw,140px)`, section H2s `clamp(42px,5.5vw,72px)`); content
headings use Tailwind steps (`text-2xl`–`text-6xl`).

**Known drift (normalize during Phase 5 polish):** `.font-mono-label`
tracking is overridden per-component with 8 distinct values (0.04em–0.25em) —
pick canonical values per context. `MemberFAQ` uses `font-mono` (system mono)
instead of `font-mono-label` for the +/− glyph.

---

## Spacing, Radii, Shadows

> Source of truth: `app/globals.css` `@theme` + component usage.

**Radius tokens:**
```css
--radius-pill: 9999px       /* buttons, search pill */
--radius-card: 22px         /* cards, gallery, sidebar */
--radius-card-sm: 14px      /* icon boxes, small surfaces */
```

**Shadow tokens:**
```css
--shadow-pill: 0 16px 42px -18px rgba(25,25,25,0.28), 0 2px 8px rgba(25,25,25,0.06);
--shadow-card-hover: 0 28px 56px -20px rgba(25,25,25,0.35);
```

**Layout patterns in use:**
- Horizontal padding: `px-6 md:px-10` (canonical)
- Section vertical rhythm: homepage `py-24 md:py-32`; member pages fluid `py-[clamp(90px,11vw,150px)]` (two coexisting systems)
- Container max-widths: 1400px (homepage sections/nav/footer), 1200px (stay page, checkout), 800–900px (narrow editorial/member blocks)

**Known drift (normalize during Phase 5 polish):** bespoke radii
(`rounded-[10px]`…`rounded-[26px]`) alongside `rounded-card`; six ad-hoc
container widths (1400/1360/1300/1200/1100/900); two section-padding systems.

---

## Icons

> Source of truth: `components/Icon.tsx` — lucide-react behind a typed wrapper.

- All icons go through `<Icon name="..." />`; **never import lucide-react directly** in components.
- 36 mapped names (search, pin, calendar, user, x, menu, heart, chevrons, check, info, key, clock, shield, star, bed, bath, sofa, users, building, sparkles, wifi, tv, car, etc.).
- Defaults: `size={20}`, `strokeWidth={1.6}`. Sizes in use: 16 / 18 / 20 / 22 / 24 / 32.
- Per-context stroke overrides exist: TabBar 1.8, StayAmenities 1.6, MobileSearchHeader 2.2, LoginForm check 3.

**KNOWN ISSUE (fix in Phase 5 polish):** icons rendered inside tiles/boxes
(e.g. `rounded-[14px]` icon boxes, checkout gate circles) read optically
small — lucide glyphs carry built-in padding inside their 24px viewBox, and
at strokeWidth 1.6 with a 16–20px size in a 40–48px container the glyph
occupies too little of the tile. Fix direction: larger size and/or heavier
stroke inside containers, or a wrapper that scales the glyph to ~60–70% of
the tile. Audit all icon-in-tile call sites when addressed.

---

## Logo

> Source of truth: `components/chrome/Logo.tsx` — the logo is a React
> component, not a static asset.

**Primary Mark:**
- Square tile: dark gray `#474747` background, `rounded-[26%]`
- Inside: white X stroke + gray (`#8a8a8a`) X stroke + small gold pulsing dot (`.pulse-dot`)
- Wordmark: "AVEXA" in Plus Jakarta Sans 800, gold (`--color-gold`)

**Note:** `#474747` is intentionally outside the color token set (logo-only gray).

**Static exports:** `/public/logos/` does **not exist yet** in the repo — the
30+ PNG export kit lives outside the codebase. Add exported SVG/PNG variants
(dark/light/gold/icon-only/wordmark) before launch for OG images, favicons,
and email templates.

---

## Animations

> Source of truth: `app/globals.css` keyframes + `components/Reveal.tsx`.

**Easing:** `--ease-snap: cubic-bezier(0.16, 1, 0.3, 1)` — the canonical ease,
used by Reveal, hero mounts, accordions, and most transitions.

**Scroll reveals — `<Reveal />` component:**
- Directions: `up` (y 24→0), `left`, `right`, `fade`
- Duration 0.9s, ease `[0.16, 1, 0.3, 1]`, `whileInView` with `once: true, amount: 0.25`

**Keyframes defined in globals.css:**
- `pulse` — gold dot: 2.4s ease-in-out infinite (opacity 0.55→1, scale 1→1.35)
- `ctaPulse` — gold glow ring on CTAs (`.cta-pulse`): 2.4s
- `drift` — hero background blob: 18–20s alternate
- `rise` / `heroWord` — entrance translations for hero text

**Timings in practice:**
- Hero mount: 0.9–1.0s with 0.18–0.7s stagger delays
- Overlays/sheets (mobile search): 0.22s enter/exit
- Hover transitions: 200–500ms (drifted — see below)
- Page transitions: none implemented

**Known drift (normalize during Phase 5 polish):** card hover-lift durations
vary (300/400/500ms/default) for the same interaction; `cta-pulse` is applied
to some primary CTAs but not others (missing on LoggedOutHero, booking
sidebar Reserve, Nav signup) — define one rule.

---

# WEBSITE COPYWRITING — FINAL

## Homepage

### Hero Section

**Section eyebrow:**
```
— SEAMLESS URBAN HOSPITALITY
```

**H1 (Main headline):**
```
Bucharest City Center, Unlocked.
```

**H2 (Sub-headline):**
```
Premium apartments in the heart of Bucharest.
No keys. No queues. No compromise.
```

**Hero stats (3 numbers):**
- 120+ Apartments
- 4 Neighborhoods (will scale)
- 4.9 Guest Rating

---

### Core Pitch Section

**Headline:**
```
Built for people who don't have time to waste.
```

**Body:**
```
Whether you're closing a deal in the financial district 
or taking three days for yourself — AVEXA is your base 
of operations.

We removed the front desk. We upgraded everything else.
Hotel-grade linens. Clinical cleanliness. Absolute privacy.
Your schedule. Your space. Zero negotiation.
```

---

### Editorial Cycling Text (auto-rotating)

```
Slide 1: Business or leisure.
Slide 2: Long stay or weekend away.
Slide 3: The city, on your terms.
Slide 4: No front desk. No friction. No compromise.
```

---

### How It Works

**Section label:**
```
— THE AVEXA STANDARD
```

**Section title:**
```
Three steps to your Bucharest city center apartment.
```

**Step 01 — Reserve in 90 seconds**
```
Skip the platforms. Book your Bucharest city center 
space directly, get our lowest guaranteed rate, and 
lock it in before someone else does.
```
Tag: `2 minutes`

**Step 02 — Check in from anywhere**
```
No lobby. No waiting. Verify your ID from your phone 
and receive your unique access code exactly 24 hours 
before you arrive in Bucharest city center.
```
Tag: `Fully online`

**Step 03 — Walk straight in**
```
Your Bucharest city center door opens. Lights calibrated. 
Linens pressed. Temperature set. The space is ready. 
The city is next.
```
Tag: `24/7 arrival`

---

### Locations Preview

**Section label:**
```
— WHERE WE ARE
```

**Section title:**
```
Location isn't everything. Until it is.
```

**Subtitle:**
```
The right neighborhood changes everything about a stay.
We chose carefully so you don't have to.
```

---

### Member Benefits Preview

**Section label:**
```
— MEMBER CLUB
```

**Section title:**
```
The best rate is yours.
```

**Subtitle:**
```
Free to join, free forever. Every AVEXA member gets 
the lowest price we offer — plus a set of perks that 
make every stay sharper, faster, and better value.
```

**Statement:**
```
No tiers. No points. No catch. No expiry.
Just the lowest rate, every time.
```

---

### Footer

**Tagline (NOT NUMA's "We do the room"):**
```
No front desk. No friction. No compromise.
```

**Trust line:**
```
Guest Approved: 9.9 / 10 on Booking.com · 4.98 / 5 on Airbnb
```

**Legal:**
```
AVEXA Brand — EU-IPO Registered Trademark ®
© 2026 AVEXA Stays · Bucharest
```

**Newsletter:**
```
Headline: Stay close, travel often.
CTA: Sign me up
```

---

## Locations Page

**Section label:**
```
— WHERE WE ARE
```

**Title:**
```
Location isn't everything. Until it is.
```

**Subtitle:**
```
The right neighborhood changes everything about a stay.
We chose carefully so you don't have to.
```

### Neighborhood Cards

**CALEA VICTORIEI — The Prestige Mile**
```
Bucharest's most iconic boulevard.

Step outside and you're already exactly where you need 
to be — flagship boutiques, celebrated restaurants, 
museums that actually matter.

For the traveler who considers location a non-negotiable.
```

**UNIVERSITATE — The Center of Everything**
```
Zero tolerance for inconvenience.

Positioned at the city's gravitational center — major 
transit, cultural landmarks, and the business district 
all within walking distance.

For executives and explorers who move fast and need 
the city to keep up.
```

**OLD TOWN — History With a Pulse**
```
The energy is unmistakable. The sleep is uninterrupted.

Bucharest's historic core — vibrant by day, electric 
by night.

Inside your AVEXA apartment, advanced soundproofing 
and precision design ensure you wake up ready, not 
exhausted.
```

**PIAȚA ROMANĂ — The Quiet Authority**
```
Connected, refined, and deliberately low-key.

Specialty coffee shops, embassy row, interwar 
architecture, and a neighborhood that lets you breathe.

The preferred base for those who move through the 
city at their own pace.
```

### Empty State (No Results)

**Headline:**
```
This sanctuary is already spoken for.
But the city isn't.
```

**Subtext:**
```
See available dates below — or explore other AVEXA 
spaces nearby.
```

---

## Member Benefits Page

### Hero

**H1:**
```
The best rate is yours.
```

**Body:**
```
Free to join, free forever. Every AVEXA member gets 
the lowest price we offer — plus a set of perks that 
make every stay sharper, faster, and better value.
```

**Hero stats:**
- 15% Savings per stay
- 0 € Membership cost
- 4.9 Member rating

---

### "No tiers" Statement Section (gold background)

```
No tiers. No points.
No catch. No expiry.
Just the lowest rate, every time.
```

---

### 6 Benefit Cards

**01 — 15% off every booking**
```
The member rate is automatic — applied the moment 
you sign in. No promo codes, no flash sales to hunt. 
Just the best price, every single time you book.
```
Tag: `Applied automatically`

**02 — 25% off stays of 7+ nights**
```
Planning a longer visit? Stays of a week or more unlock 
an even deeper discount — stacked on top of your 
member rate.
```
Tag: `Stacks with member rate`

**03 — Free cancellation**
```
Cancel right up to the day of arrival at no cost. 
Plans change — your booking should change with them, 
no questions asked.
```
Tag: `Until arrival day`

**04 — Early check-in from 2 PM**
```
Standard check-in is 3 PM. As a member, you can 
check in from 2 PM instead — subject to same-day 
availability.
```
Tag: `Subject to availability`

**05 — Late check-out until 1 PM**
```
No rush on departure day. Stay a little longer, pack 
at your pace, have one more coffee before heading out.
```
Tag: `Automatic for members`

**06 — Welcome drinks & snacks**
```
Premium drinks and snacks waiting at the door. 
Every arrival. No request needed.
```
Tag: `Every stay`

---

### Loyalty Section

**Label:**
```
— LOYALTY REWARD
```

**Headline:**
```
3 trips. 10% more off.
```

**Body:**
```
After your third AVEXA stay, unlock a 10% bonus 
discount — stacked on top of your member rate and 
long-stay savings.
```

**CTA:**
```
Start saving →
```

---

### Guest vs Member Comparison Table

| Feature | Guest | Member |
|---------|-------|--------|
| Best available rate | Standard price | 15% off |
| 7+ night discount | — | 25% off |
| Cancellation | 48h notice | Free until arrival |
| Check-in | 3:00 PM | 2:00 PM |
| Check-out | 11:00 AM | 1:00 PM |
| Welcome package | — | Drinks & snacks |
| Cost | — | Free, forever |

---

### Joining is instant Section (gold background)

**Label:**
```
— 30 SECONDS
```

**Headline:**
```
Joining is instant
```

**3 steps:**
- 01. Enter your email — That's your login. No forms, no paperwork.
- 02. Create a password — Pick something strong. You're done.
- 03. Book at member rates — Your discount applies from the first booking.

---

### FAQ Section

**Label:**
```
— QUESTIONS
```

**Title:**
```
Good questions.
```

**Questions:**
- Is membership really free?
- How is the 15% discount applied?
- Can I cancel a booking for free?
- Does the 7+ night discount stack with the member rate?
- Is early check-in guaranteed?
- What's included in the welcome package?

---

### Final CTA

**Headline:**
```
Start saving on every stay.
```

**Subtext:**
```
Join the AVEXA member club — free, in 30 seconds.
```

**Buttons:**
- Primary: `Join free →`
- Secondary: `Browse locations`

---

## UI Micro-Copy

| Element | Copy |
|---------|------|
| Search placeholder | Where in Bucharest? |
| Check-in field | Arriving |
| Check-out field | Leaving |
| Guests field | How many? |
| Search button | Find my space |
| Filter button | Refine your stay |
| Book button | Reserve this space |
| Login | Sign in |
| Sign up | Join free |
| Loading | Finding your space... |
| Available badge | Available now |
| Sold out badge | Fully booked |
| Member badge | AVEXA Member |
| Rating display | ★ [X.XX] · Verified guests only |
| Wi-Fi card | Zero friction starts here. Scan to connect. |
| Welcome card | Your sanctuary is ready. The city is waiting. |
| Empty cart | No bookings yet. Start with a search. |
| 404 page H1 | This page is fully booked. |
| 404 page sub | Or maybe it never existed. Either way, the city is still here. |
| 500 page H1 | Something broke. We're on it. |
| Cookie banner | We use cookies to make your stay smoother. |

---

## Meta Tags (per page)

### Homepage
```
<title>AVEXA STAYS — Premium Apartments in Bucharest City Center</title>
<meta name="description" content="Premium short-term apartments in Bucharest city center. Digital check-in, no front desk, hotel-grade quality. Book direct for the lowest guaranteed rate.">
```

### Locations
```
<title>Bucharest Neighborhoods — AVEXA STAYS</title>
<meta name="description" content="Explore Bucharest city center neighborhoods. From Calea Victoriei to Old Town, premium apartments in every prime location.">
```

### Member Benefits
```
<title>Member Benefits — Best Rate Guaranteed | AVEXA STAYS</title>
<meta name="description" content="Join free and get 15% off every Bucharest city center booking. No tiers, no points, no catch. Just the lowest rate, every time.">
```

### Property pages (template)
```
<title>{Property Name} — {Neighborhood} | AVEXA STAYS</title>
<meta name="description" content="{Property type} in {neighborhood}, Bucharest city center. {Beds}, {bathrooms}. Digital check-in. From €{price}/night.">
```

---

## Social Media Voice

**Instagram bio:**
```
Premium apartments. Bucharest city center.
No front desk. No friction. No compromise.
📍 Arrive. Unlock. Live.
```

**Content pillars:**
- Apartment photography (clinical, editorial)
- Neighborhood photography (urban, candid)
- Detail shots (linens, lighting, finishes)
- Local recommendations (subtle, not heavy-handed)

**Caption style:**
- 1-2 lines maximum
- No emoji clutter
- Lowercase first letter for casual posts
- Confident statements, not questions

---

## Physical Branding

**Towels (100x140, 50x100):**
- Embroidery: clean "AVEXA" wordmark only, tone-on-tone thread
- No tagline on physical objects

**Welcome card (inside apartment):**
- Cover: `Arrive. Unlock. Live.`
- Inside: `Your sanctuary is ready. The city is waiting.`

**Wi-Fi card:**
- `Zero friction starts here. Scan to connect.`

**Branded water/snacks:**
- `Compliments of AVEXA. The city, on your terms.`
