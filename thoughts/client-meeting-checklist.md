# AVEXA — Setup checklist (ghid pas-cu-pas)

> Pentru meeting cu clientul. Fiecare secțiune: **scop · cine · pași · unde pun valoarea în proiect · verificare**.
> Repere proiect: domeniu `avexastays.com` · Supabase project ref `iebxcxaxfpbqyumoprbt`
> · preview `https://avexa-stays-git-feat-nextjs-platform-berti8.vercel.app`
> · firmă `PRIME GOLD LIVING SRL` · expeditor email `bookings@avexastays.com`
> Env-urile se pun în **Vercel → Settings → Environment Variables** (bifează scope-urile **Production + Preview**) și local în `.env.local`.

---

## Unde pun fiecare cheie? (Vercel env ≠ Supabase ≠ Google Cloud)

> Întrebarea recurentă: „o bag în Vercel env vars?" Răspuns rapid mai jos. Regula: cheile pe care le folosește **browserul** (`NEXT_PUBLIC_*`) stau în Vercel; cheile pe care le folosește **un serviciu** (Supabase trimite email, face OAuth) stau în acel serviciu.

| Setare | Unde se pune | În Vercel env? |
|---|---|---|
| Supabase URL + Anon key | Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) | ✅ DA (deja) |
| Supabase Service Role key | Vercel (`SUPABASE_SERVICE_ROLE_KEY`, server-only) | ✅ DA (deja) |
| Google Maps key | Vercel (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) | ✅ DA (deja) |
| Google Maps referrers | Google Cloud Console (pe cheie) | ❌ NU |
| **Google OAuth Client ID + Secret** | **Supabase → Auth → Providers → Google** | ❌ **NU** |
| **Resend API key (`re_...`)** | **Supabase → SMTP Settings** | ❌ **NU** |
| Stripe `pk_` / `sk_` / `whsec_` | Vercel env | ✅ DA (când facem plăți) |
| GA4 / PostHog ID-uri | Vercel (`NEXT_PUBLIC_*`) | ✅ DA (când adăugăm analytics) |

---

## 0) Setări imediate Supabase (Robert, ACUM — fără client)

**Scop:** să poți testa auth-ul azi.
1. https://supabase.com/dashboard/project/iebxcxaxfpbqyumoprbt/auth/providers → **Email**
2. **Confirm email → OFF** (din secțiunea User Signups) → **Save**
3. **Minimum password length → 8** → Save
4. Authentication → **URL Configuration → Redirect URLs** → adaugă:
   - `https://avexa-stays-git-feat-nextjs-platform-berti8.vercel.app/**`
   - `https://avexastays.com/**` (pentru lansare)
5. **Verificare:** `/login` → Sign up cu email+parolă → te loghează direct.

---

## 1) Resend (trimitere emailuri) — confirmare cont + reset parolă

**Scop:** ca Supabase să trimită REAL emailurile (confirmare cont, reset parolă, mai târziu confirmare booking). Fără SMTP custom, Supabase trimite doar câteva emailuri/oră de pe domeniul lui — bun doar de test, nu de producție.
**Cine:** client (cont Resend + acces la DNS-ul domeniului `avexastays.com`).
**Ce domeniu pui:** **`avexastays.com`** (domeniul site-ului). Expeditor: **`bookings@avexastays.com`** (sau `noreply@` / `account@avexastays.com` — orice adresă @avexastays.com merge după ce domeniul e „Verified").
**Unde stă cheia:** **doar în Supabase (SMTP), NU în Vercel.**

**Pași:**
1. Cont pe **resend.com** (free: 3.000 emailuri/lună, 100/zi).
2. **Domains → Add Domain** → scrie **`avexastays.com`** → Add.
3. Resend afișează înregistrările **DNS** de adăugat la furnizorul unde e găzduit DNS-ul domeniului (Cloudflare / GoDaddy / Namecheap etc.):
   - **MX** pe `send` → `feedback-smtp.eu-west-1.amazonses.com` (priority 10) — pt. bounce/feedback
   - **TXT (SPF)** pe `send` → `v=spf1 include:amazonses.com ~all`
   - **TXT (DKIM)** pe `resend._domainkey` → valoarea lungă dată de Resend
   - (opțional, recomandat) **TXT (DMARC)** pe `_dmarc` → `v=DMARC1; p=none;`
   > Valorile exacte le copiezi din Resend (pot diferi ușor în funcție de regiune). Alege regiunea **EU** la creare ca să fie aproape de RO.
4. După ce ai salvat înregistrările → în Resend apasă **Verify DNS Records** → aștepți **„Verified"** (de la câteva minute la câteva ore, în funcție de DNS).
5. **API Keys → Create API Key** (Sending access) → copiază cheia **`re_...`** (se vede o singură dată).
6. **Supabase → Project Settings → Authentication → SMTP Settings → Enable Custom SMTP:**
   - Sender email: `bookings@avexastays.com` · Sender name: `AVEXA STAYS`
   - Host: `smtp.resend.com` · Port: **465** (SSL) — sau 587 (TLS)
   - Username: `resend` · Password: **cheia `re_...`**
   - Save.
7. (Producție) Supabase → Authentication → Providers → Email → **Confirm email → ON** (acum poți, fiindcă emailurile pleacă real).

**Verificare:** Sign up cu un email real → primești emailul de confirmare. „Forgot password" → primești link de reset.

---

## 2) Stripe (plăți) — TEST întâi, apoi LIVE

**Scop:** plăți reale la checkout → webhook creează rezervarea în Hostaway.
**Cine:** client creează contul Stripe pe firma `PRIME GOLD LIVING SRL` (CUI 52265361).

**Pași (test):**
1. Creează cont pe **dashboard.stripe.com**, completează datele firmei.
2. Lasă comutatorul pe **Test mode** (sus).
3. **Developers → API keys** → copiază:
   - **Publishable key** `pk_test_...` → env `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** `sk_test_...` → env `STRIPE_SECRET_KEY`
4. **Webhook secret** îl generăm DUPĂ ce construiesc endpointul: Developers → Webhooks → Add endpoint → `https://<domeniu>/api/webhooks/stripe` → copiezi **Signing secret** `whsec_...` → env `STRIPE_WEBHOOK_SECRET`.
5. Trimite-mi cele 2 chei test → **eu construiesc** checkout + webhook + rezervare Hostaway + email confirmare.

**La lansare:** treci pe **Live mode** → repeți cu cheile `pk_live_` / `sk_live_` + webhook live.
**Verificare (test):** plată cu cardul `4242 4242 4242 4242`, orice dată viitoare + CVC.

---

## 3) Google Maps — hărți reale ✅ GATA (verificat în browser)

**Status:** **FĂCUT și testat live (desktop + mobil).** Funcționează tot:
- **Pagina proprietății** — hartă Google (Embed API) în secțiunea „Where you'll be".
- **`/locations`** — hartă **interactivă** (Maps JavaScript API) cu pini de preț stil Airbnb, **clustering** pentru suite-le din aceeași clădire (ex. „4 suites from €…" → click pe cluster → se desfac în pini individuali), sync card↔pin la hover + scroll, iar pe mobil tap pe pin → card mic cu proprietatea → link la pagina ei.
- Cheia e pe Vercel, **Maps JavaScript API + Embed API active**, iar referrer-ul cheii autorizează `*.vercel.app` + `avexastays.com`.

**Dacă vreodată apare „Oops! Something went wrong" pe hartă:** lipsește referrer-ul pe cheie. Google Cloud Console → APIs & Services → Credentials → cheia Maps → **Application restrictions → HTTP referrers** → adaugă `https://*.vercel.app/*` și `https://avexastays.com/*` → Save (propagare 1-5 min). Codul cade automat pe harta decorativă până se rezolvă, deci pagina nu se strică.

---

## 4) Google OAuth — butonul "Continue with Google"

**Scop:** login cu Google (codul e gata, trebuie doar configurat).
**Cine:** client/Robert (Google Cloud) + Robert (Supabase).
**Unde se pun cheile:** **în Supabase, NU în Vercel.** Pentru OAuth nu adaugi nimic în Vercel env vars — fluxul trece prin Supabase, care ține Client ID + Secret. (Din partea app-ului sunt deja suficiente `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.)

**Pași:**
1. **Google Cloud Console → APIs & Services → OAuth consent screen** → User type **External** → nume app „AVEXA Stays", user support email, developer email, **Authorized domain** `avexastays.com` → Save. (Dacă rămâne în „Testing", adaugă-ți emailul la **Test users** — altfel doar tu poți testa; sau apasă **Publish app**.)
2. **APIs & Services → Credentials → Create credentials → OAuth client ID → Application type: Web application** (nume ex. „Avexa auth supabase"):
   - **Authorized JavaScript origins** = DOAR origini, FĂRĂ cale. **Lasă-l GOL** (nu e necesar pentru Supabase). ⚠️ NU pune aici URL-ul cu `/auth/v1/callback` — de-aia dă eroarea „Invalid Origin: URIs must not contain a path".
   - **Authorized redirect URIs** → **+ Add URI** → `https://iebxcxaxfpbqyumoprbt.supabase.co/auth/v1/callback` ← **AICI** merge callback-ul (singurul URL obligatoriu).
   - **Create** → copiază **Client ID** + **Client secret**.
3. **Supabase → Authentication → Providers → Google** → **Enable** → lipește **Client ID** + **Client Secret** → **Save**.
4. (Deja făcut) Supabase → Authentication → **URL Configuration → Redirect URLs** conține `https://*.vercel.app/**` + `https://avexastays.com/**` (ca să se întoarcă în app după login).

**Tabel rapid pentru ecranul „Create OAuth client ID":**
| Câmp | Ce pui |
|---|---|
| Authorized JavaScript origins | *gol* (sau `https://iebxcxaxfpbqyumoprbt.supabase.co`, fără cale) |
| Authorized redirect URIs | `https://iebxcxaxfpbqyumoprbt.supabase.co/auth/v1/callback` |

**Verificare:** `/login` → „Continue with Google" → alegi contul Google → te întoarce logat.

---

## 5) Analytics — GA4 + PostHog + consent

**Scop:** trafic + conversii.
**Cine:** client creează conturile; eu adaug snippet-urile.

**GA4:**
1. **analytics.google.com** → Admin → Create Property → "AVEXA Stays" → Web data stream pentru `avexastays.com`.
2. Copiază **Measurement ID** `G-XXXXXXXXXX` → env `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

**PostHog (EU):**
1. **eu.posthog.com** → create project "AVEXA".
2. Project Settings → **Project API Key** `phc_...` → env `NEXT_PUBLIC_POSTHOG_KEY`.
3. Host: `https://eu.i.posthog.com` → env `NEXT_PUBLIC_POSTHOG_HOST` (deja pus în .env.example).

4. Trimite-mi ID-urile → **eu adaug** GA4 + PostHog + banner cookie-consent (GDPR).

**Verificare:** Realtime în GA4 / Activity în PostHog arată vizite.

---

## 6) Google Search Console — indexare

**Scop:** Google să indexeze site-ul + să trimitem sitemap.
**Cine:** client (proprietar domeniu).

**Pași:**
1. **search.google.com/search-console** → Add property → **Domain** `avexastays.com`.
2. Verifică prin **DNS TXT** (adaugi înregistrarea pe care o dă Google) — sau prin GA4 dacă e deja legat.
3. După lansare: **Sitemaps → Add** `https://avexastays.com/sitemap.xml`.

**Verificare:** "Ownership verified" + sitemap "Success".

---

## 7) Vercel — env + plan

**Scop:** producție stabilă.
**Cine:** Robert.

**Pași:**
1. **Vercel → avexa-stays → Settings → Environment Variables** → pentru fiecare cheie de mai sus: Name + Value + bifează **Production + Preview** → Save.
2. După adăugări → **Redeploy** (env-urile `NEXT_PUBLIC_` se aplică la build).
3. La lansare comercială: **upgrade la plan Pro**.

**Verificare:** funcția care folosește cheia merge pe preview (ex: calendar cu prețuri = Supabase OK; hartă = Maps OK).

---

## Rezumat priorități pentru meeting
1. **Resend** (email) — deblochează confirmare + reset
2. **Stripe test** — deblochează plăți (eu construiesc apoi)
3. ~~Google Maps~~ ✅ **GATA** — hărți reale, verificate în browser
4. **Google OAuth** — login Google (Client ID/Secret → Supabase, nu Vercel)
5. **GA4 + PostHog** — analytics
6. **Search Console** — la lansare
7. **Vercel Pro + env scopes** — la lansare

**Ce rămâne în sarcina mea (dev), după ce primesc cheile:** Stripe checkout+webhook+rezervare Hostaway+email, snippet GA4/PostHog + consent, multi-room checkout, flip lansare.
