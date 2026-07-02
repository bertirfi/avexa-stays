# P7 — Review total (multi-agent) · 2026-07-02

**Metodă:** 8 agenți paraleli (security, bani, Hostaway, auth/DB/RLS, UI booking, UI marketing, SEO, dependențe), fiecare pe felia lui; criticele re-verificate manual de orchestrator pe cod. Typecheck + lint: **curate** (0 erori). Deduplicat și re-ierarhizat mai jos.

## Verdict general

**Fundația e senior-grade.** Trei agenți independenți au confirmat, pe cod, aceleași puncte forte: granița de încredere e corectă (prețul se re-derivă server-side din Hostaway live, identitatea vine doar din sesiunea Supabase, Hostaway e strict server-side), RLS e complet și strâns pe toate tabelele (scoping pe owner, `integration_tokens`/`processed_stripe_events` doar service-role, zero politici `using(true)`), idempotența plăților e dublă și reală (events + row-lock + idempotency keys + refund automat), iar sumele sunt exacte, fără drift de virgulă mobilă, RON-only la încasare.

**Ce blochează „sellable”:** stratul de finisare — my-trips arată date mock în loc de rezervările reale, SEO-ul pe paginile de bani are duplicate/încălcări confirmate, newsletter-ul e fals, iar UI-ul se ia după oglinda localStorage în loc de sesiunea server (o singură cauză-rădăcină, ~6 simptome).

Scor agregat (după deduplicare și re-verificare): **2 critice · 9 workstream-uri HIGH · ~18 medium · ~15 low**.

## CRITICE (verificate manual pe cod)

### C1 — Mock-ul lovea PMS-ul REAL prin confirmation ✅ FIXAT în acest commit
`lib/hostaway/confirmation.ts` + `app/api/webhooks/stripe/route.ts:214` — `createReservation` mock returnează id negativ, dar webhook-ul chema necondiționat `sendBookingConfirmation`, care făcea `getReservation(-N)` de până la 25 de ori (~3,5 min) pe API-ul REAL, per test mock. Cu `HOSTAWAY_MOCK_RESERVATIONS=1` activ acum pe preview, orice test de plată ar fi ars rate-limit real. **Fix aplicat:** guard `if (reservationId <= 0) return;` la intrarea în `sendBookingConfirmation`.

### C2 — SEO pe paginile de bani: duplicate exacte + toate peste limită (verificat)
`lib/properties.ts` + `app/(marketing)/locations/[slug]/page.tsx:140` — meta description = primul paragraf al descrierii editoriale:
- **101 și 201 IDENTICE** (203 caractere); **202, 302, 303 IDENTICE între ele** (213 caractere) → Google le tratează ca duplicate content pe 5 din 8 pagini de proprietate.
- Lungimi: 101=203, 201=203, 202=213, **203=350**, 301=124 (singura OK), 302=213, 303=213, 304=234 — 7/8 peste 155.
- Plus cele 4 probleme știute din QA, toate încă prezente: H1 homepage fără „apartments” („Bucharest City Center, unlocked”), keyword-ul principal absent din primul copy al homepage-ului (apare abia într-un h2 la HowItWorks), title-ul /locations fără keyword („Locations in Bucharest”), descriere /locations 159 car.; title proprietate 301 = 68 caractere raw.
**Fix:** câmp dedicat `metaDescription` per proprietate (8 texte unice ≤155), H1 + prima frază cu „Bucharest city center apartments”, title/desc /locations, title 301. Copy-ul cere taste — de scris cu model top, review de client pe ton.

## HIGH — 9 workstream-uri (deduplicate din 4 agenți)

- **H1 · Zona de membru e mock (blocker de vânzare).** `components/trips/MyTripsApp.tsx` + `lib/trips.ts`: /my-trips randează 3 sejururi fictive hardcodate, gate-uite de `localStorage.avexa_has_trips`; rezervările reale (scrise corect în `bookings`) nu sunt interogate NICIODATĂ. Un membru care a plătit vede sejururi inventate. Aceeași cauză-rădăcină (oglinda localStorage `avexa_user`) produce: flash de „Sign up” în Nav după hidratare (`Nav.tsx:64`), gate-uri client în profile/checkout/sidebar care pot minți când mirror-ul e stale. **Fix (un singur refactor):** sesiunea derivată server-side (RSC → props), my-trips citește `bookings` prin RLS, șterge `mockTrips`/`hasTrips`.
- **H2 · Prețul afișat vs. prețul taxat pot divergea silențios.** Sidebar + BookingSummary calculează din cache (≤15 min stale) / `localStorage.avexa_booking` / breakfast hardcodat 105, iar serverul taxează din citirea LIVE Hostaway — fără nicio reconciliere sau gate „prețul s-a schimbat”. Serverul nu poate sub-taxa (bine), dar oaspetele poate vedea X și plăti Y. **Fix:** pagina de checkout cere quote-ul serverului și EL alimentează sumarul + butonul Pay; breakfast din catalog; assert `total_ron×100 === session.amount_total` în webhook înainte de createReservation.
- **H3 · Reset-password fără verificarea sesiunii de recovery.** `ResetPasswordForm` cheamă `updateUser({password})` orbește — schimbă parola oricărei sesiuni active; link expirat = eroare confuză. **Fix:** gate pe evenimentul `PASSWORD_RECOVERY` / verificare sesiune, altfel redirect la /login.
- **H4 · Eșec ambiguu la createReservation → refund cu rezervare orfană în PMS.** Dacă POST-ul creează rezervarea dar răspunsul se pierde/parsează greșit, catch-ul refundează și anulează booking-ul, iar PMS-ul rămâne cu rezervarea blocând calendarul, neplătită. Fereastră mică, impact mare. **Fix:** validare `reservation?.id` imediat după POST + pe calea de refund, lookup best-effort după date+listing+provider și cancel al orfanei.
- **H5 · Hardening client Hostaway.** 429 nehandlat (doar 403 are retry) → un burst sync+webhook+quote pe instanțe multiple poate depăși 20 req/10s/cont și un guest la checkout primește „unavailable”; refresh de token fără single-flight (N call-uri concurente = N token requests, last-writer-wins). **Fix:** retry cu backoff pe 429 (respectă Retry-After), promise-cache pe refresh, upsert condiționat pe `expires_at`.
- **H6 · Fereastra de sync de 180 de zile < orizontul de booking de 12 luni.** Webhook (`REFRESH_DAYS=180`) + sync (`SYNC_DAYS=180`): o rezervare OTA la luna 8 nu se reflectă în cache — site-ul arată disponibil ce nu e (quote-ul live salvează banii, dar UX-ul minte). **Fix:** 380+ zile în ambele.
- **H7 · Newsletter-ul e fals.** `NewsletterForm.tsx:11` — `preventDefault()` + „Subscribed ✓” fără să salveze nicăieri; textul GDPR de lângă promite emailuri care nu vor veni. **Fix:** endpoint real (Brevo) sau scoate formularul până există.
- **H8 · Off-by-one de timezone la afișarea datelor.** `lib/booking.ts:117` — `new Date('YYYY-MM-DD')` = miezul nopții UTC, citit apoi cu `getDate()` local → oaspeții din emisfera vestică văd check-in cu o zi mai devreme pe ecranul de plată; același bug în serializarea URL din search (`toISOString().slice(0,10)`). **Fix:** `parseYmd`/`ymd` local peste tot.
- **H9 · CVE în postcss-ul vendorizat de Next** (GHSA-qx2v-qp2m-jg93, XSS CVSS 6.1). `npm audit fix` NU îl rezolvă; `--force` ar downgrade-ui Next la 9 (interzis). **Fix:** urmărit upstream / override `"next/postcss"` testat; NU rula `--force`.

## MEDIUM (selecție — toate păstrate în rapoartele agenților)

- Comparații de secret non-constant-time pe `/api/sync`, `/api/cron/fx`, `/api/admin/seed`, `/api/hostaway/diagnostic` (webhook-ul Hostaway o face corect cu `timingSafeEqual`) — de uniformizat.
- `/api/hostaway/diagnostic` de șters/404 la lansare (endpoint de introspecție live).
- Fără rate limit pe `/api/checkout` (fiecare POST = citire Hostaway live + row pending + sesiune Stripe).
- `ConfirmationPoller` moare mut după 60s — guest cu bani luați rămâne pe spinner infinit; fallback „plata e la noi, vezi My Trips / contact”.
- Dublu-click / back-and-retry pe Pay creează bookings pending duplicate (dedupe server pe user+dates înainte de insert).
- ContactInfoStep fără `autoComplete`/`htmlFor` (conversie mobil); linkuri legale cu `<a>` în loc de `<Link>` (reload mid-checkout).
- Profil: mutații fără Zod; toggle-urile de preferințe pur locale — `marketing_consent` nu se persistă NICIODATĂ (problemă de consimțământ GDPR pentru Brevo).
- Webhook vs sync: fallback de preț inconsistent (`price_ron: 0` hardcodat în webhook; `?? ` nu prinde 0 → o noapte se poate afișa la 0 RON) + `price_from_ron` flip-flop → funcție de derivare comună.
- Anularea din PMS eliberează cache-ul doar dacă payload-ul are `listingMapId` — de eliberat direct pe intervalul booking-ului.
- Eșecul charge-ului offline doar `console.warn` — de pus flag pe booking (`pms_payment_unrecorded`) + alertă; clientul ar cere bani deja încasați.
- `CA_LINK_RE` prea îngust (respinge `-`, `_`, query) — un format nou de token CA = zero emailuri, silențios; buget `after()` ~234s worst-case aproape de plafonul de 300s — deadline explicit înainte de fiecare sleep.
- URL-urile de redirect Stripe din `req.url` (Host spoofabil în teorie) → din env constant.
- `robots.ts` fără guard de env (azi acoperă Vercel cu x-robots-tag, dar zero defense-in-depth).
- `propertyCount` hardcodat în `lib/neighborhoods.ts` vs. numărătoare live pe /locations (drift).
- Editorial scroll-jack 400vh fără `prefers-reduced-motion`.
- Social links din Footer fără `target="_blank" rel="noopener noreferrer"`.

## LOW (rezumat)

Inline `style={{fontSize: clamp(...)}}` static (~20 locuri) → utilitare Tailwind; `MonthGrid` duplicat în 3 fișiere cu logică subtil diferită; modalele nu fac focus-trap (gallery fără `role="dialog"`); span clickabil în button (StayGallery); pill „Member rate applied” necondiționat cu discount 0; `safeNext` — de trecut pe parse pozitiv `new URL`; `force-dynamic` explicit pe layout-ul de membru (defense-in-depth); spread `...input` în payload-ul createReservation → câmpuri explicite; paletă neighborhoods duplicată în 2 fișiere; `class-variance-authority` neimportat nicăieri → uninstall; range-uri package.json de aliniat (`next ^15.5.20`, tailwind fără string „beta”); bump-uri majore (motion 12, lucide 1.x, tailwind-merge 3) DOAR post-lansare, în PR-uri izolate.

## Dependențe — verdict
zod, stripe, @supabase/ssr, react 19, clsx: la zi. Fără pachete git-pinned, fără duplicate în lock. Singura problemă reală: CVE-ul postcss vendorizat de Next (vezi H9).

## Ordinea de fix propusă
1. **F1 (făcut):** C1 guard mock. ✅
2. **F2 — SEO sprint (C2):** 8 metaDescription unice + H1/keyword homepage + title/desc locations + title 301. O sesiune, un commit, re-audit.
3. **F3 — Member area real (H1):** sesiune server-side în UI + my-trips din DB + ștergere mock. Cel mai valoros refactor pentru „sellable”.
4. **F4 — Checkout trust (H2, H8 + medium-urile de checkout):** quote server pe checkout, parseYmd, poller fallback, dedupe pending, autocomplete, Link.
5. **F5 — Hostaway hardening (H4, H5, H6 + medium-urile de integrare):** 429/backoff, single-flight token, fereastră 380d, derivare preț comună, eliberare cache pe date, flag charge-fail, regex CA, deadline after().
6. **F6 — Auth & marketing (H3, H7 + profil):** recovery gate, newsletter Brevo sau ascuns, Zod + persist consimțământ.
7. **F7 — Igienă (medium/low security + deps):** timingSafeEqual peste tot, șters diagnostic la lansare, robots guard, origin din env, cva uninstall, range-uri.
