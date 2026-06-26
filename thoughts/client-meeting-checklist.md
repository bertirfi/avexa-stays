# AVEXA — Setup checklist (ghid pas-cu-pas)

> Pentru meeting cu clientul. Fiecare secțiune: **scop · cine · pași · unde pun valoarea în proiect · verificare**.
> Repere proiect: domeniu `avexastays.com` · Supabase project ref `iebxcxaxfpbqyumoprbt`
> · preview `https://avexa-stays-git-feat-nextjs-platform-berti8.vercel.app`
> · firmă `PRIME GOLD LIVING SRL` · expeditor email `bookings@avexastays.com`
> Env-urile se pun în **Vercel → Settings → Environment Variables** (bifează scope-urile **Production + Preview**) și local în `.env.local`.

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

## 1) Resend (trimitere emailuri) — confirmare + reset parolă

**Scop:** ca Supabase să trimită real emailurile (confirmare cont, reset parolă, mai târziu booking).
**Cine:** client creează contul + acces DNS la `avexastays.com`.

**Pași:**
1. Creează cont pe **resend.com** (free: 3.000 emailuri/lună).
2. **Domains → Add Domain → `avexastays.com`** → Resend îți dă niște înregistrări **DNS** (SPF/TXT + DKIM + MX opțional).
3. Adaugă acele înregistrări DNS la domeniu (unde e găzduit DNS-ul) → așteaptă "Verified".
4. **API Keys → Create API Key** → copiază cheia (`re_...`).
5. În **Supabase → Project Settings → Authentication → SMTP Settings → Enable Custom SMTP**:
   - Sender email: `bookings@avexastays.com` · Sender name: `AVEXA STAYS`
   - Host: `smtp.resend.com` · Port: `465`
   - Username: `resend` · Password: **cheia `re_...`**
   - Save.
6. (Producție) Supabase → Auth → **Confirm email → ON**.

**Verificare:** Sign up cu un email real → primești emailul de confirmare. "Forgot password" → primești link de reset.

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

## 3) Google Maps — hărți reale

**Status:** ambele hărți sunt **gata în cod**: pagina proprietății (Maps **Embed API**) și acum și `/locations` (hartă **interactivă Maps JavaScript API**, pini de preț stil Airbnb, sync card↔pin, popup pe mobil). Cheia **e setată pe Vercel** și **Maps JavaScript API e activ** (verificat în browser). **Singurul blocaj rămas:** cheia nu autorizează domeniul de preview → eroare `RefererNotAllowedMapError`. Până se rezolvă, `/locations` afișează automat harta decorativă (fallback grațios, fără cutia de eroare Google).
**Cine:** client (un singur pas: adaugă referrers pe cheie în Google Cloud Console).

**Pași:**
1. **(ACȚIUNEA IMEDIATĂ)** **Google Cloud Console → APIs & Services → Credentials** → cheia Maps → **Application restrictions → HTTP referrers** → adaugă **ambele**:
   - `https://*.vercel.app/*` (pentru preview — deblochează harta acum)
   - `https://avexastays.com/*` (pentru producție la lansare)
   - Save → așteaptă 1-5 min să se propage.
2. (Deja făcut / de confirmat) **APIs & Services → Library** → activate: **Maps JavaScript API** ✅ (confirmat), **Maps Embed API**, plus opțional **Places API (New)** + **Geocoding API**.
3. (Deja făcut) Cheia pe Vercel: env `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (scope **Production + Preview**).

**Verificare:** după ce adaugi referrer-ul, deschide `/locations` pe preview → harta Google se încarcă cu pinii de preț (fără „Oops! Something went wrong"). Pe pagina unei proprietăți, secțiunea „Where you'll be" arată harta Embed.

---

## 4) Google OAuth — butonul "Continue with Google"

**Scop:** login cu Google (codul e deja gata, trebuie doar configurat).
**Cine:** client (Google Cloud) + Robert (Supabase).

**Pași:**
1. **Google Cloud Console → APIs & Services → OAuth consent screen** → External → nume app "AVEXA Stays", email suport, domeniu `avexastays.com` → Save.
2. **Credentials → Create credentials → OAuth client ID → Web application**:
   - **Authorized redirect URIs:** `https://iebxcxaxfpbqyumoprbt.supabase.co/auth/v1/callback`
   - Create → copiază **Client ID** + **Client secret**.
3. **Supabase → Authentication → Providers → Google** → Enable → lipește Client ID + Secret → Save.

**Verificare:** `/login` → "Continue with Google" → contul se creează/loghează.

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
3. **Google Maps** (activare API) — hărți reale
4. **Google OAuth** — login Google
5. **GA4 + PostHog** — analytics
6. **Search Console** — la lansare
7. **Vercel Pro + env scopes** — la lansare

**Ce rămâne în sarcina mea (dev), după ce primesc cheile:** Stripe checkout+webhook+rezervare Hostaway+email, componenta Google Maps, snippet GA4/PostHog + consent, multi-room checkout, flip lansare.
