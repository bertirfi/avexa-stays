# ZONES.md — harta zonelor proiectului

> **Ce e acest fișier:** inventarul zonelor de inginerie ale AVEXA Stays — pentru fiecare: unde trăiește codul, ce reguli NU se încalcă (invarianți), cum modifici în siguranță și stadiul curent. Orice modificare începe prin a identifica zona aici; orice review adversarial (`/adversarial-review`) și orice validare de etapă (`/stage-validate`) parcurg aceste zone. Se actualizează la fiecare schimbare de stadiu — e o hartă vie, nu un document de arhivă.

Legendă stadiu: ✅ livrat & verificat · 🔶 parțial · ❌ neînceput · ⏳ blocat extern

## Z1 · UI & Frontend (marketing + componente)
- **Cod:** `app/(marketing)`, `components/{sections,locations,stay,member-benefits,chrome,shared}`
- **Invarianți:** Tailwind only; server components implicit; `next/image`/`Link` obligatoriu; fiecare propoziție pe rând nou (`<Sentences>`); body Manrope 450, titluri Jakarta; contrast text mic ≥ 4.5:1 (white/55+ pe ink, ink-60 = 0.65); zoom-ul mobil NU se dezactivează niciodată.
- **Modifici sigur:** schimbările de copy trec prin componenta care randează, nu prin date duplicate; verifică 375px + 1280px cu gstack browse înainte de commit.
- **Stadiu:** ✅ (Numa-style stay pages, grupare pe clădiri, readability audit 24.08). Rămas: poze hero cu oameni + top attractions (⏳ conținut de la Anca).

## Z2 · Booking & Pricing (BANI — zona cu risc maxim)
- **Cod:** `lib/pricing.ts` (unic punct de calcul), `lib/booking/{quote,schema,cancellation}.ts`, `lib/policies.ts`, `lib/fx.ts`, `components/checkout`, `app/book`
- **Invarianți:** RON = money of record; preț = ceil(bază×1.21), NIMIC altceva; re-verificare live Hostaway înainte de Stripe; suma liniilor per-noapte = totalul încasat prin construcție; curățenie 120/150/180 separată; taxă oraș 10×nopți×pers pass-through; DX7: 100/50/0 + taxa oraș integral înapoi. Regula completă: `.claude/rules/pricing.md`.
- **Modifici sigur:** NICIODATĂ calcul de preț în componente client; orice schimbare de sumă → rulează scenariile din `/stage-validate` (quote → checkout → refund) înainte de merge.
- **Stadiu:** ✅ live și dovedit (V1 cu capturi). Rămas: plata cu AVX la checkout (⏳ contabilă, 10.09), catalog upsells prin Stripe (M3.6 ❌).

## Z3 · Integrări externe
- **Cod:** `lib/hostaway/*` (server-only!), `app/api/webhooks/{stripe,hostaway}`, `lib/email/brevo.ts`, `lib/maps`, `lib/supabase/*`
- **Invarianți:** Hostaway DOAR server-side, disponibilitatea din cache-ul Supabase; semnături webhook verificate; email doar prin Brevo din office@avexastays.com (singurul sender verificat); env-urile noi din Vercel cer REDEPLOY. Reguli: `.claude/rules/hostaway.md`.
- **Modifici sigur:** orice endpoint nou → Zod + Bearer secret; niciun apel extern nou fără try/catch care nu poate pica webhook-ul.
- **Stadiu:** ✅ Hostaway sync + Stripe + Brevo confirmare rezervare (testat 24.08). Rămas: webhook Hostaway consumers extinși, automatizări mesaje (M4.2, CRM-side).

## Z4 · AVX Coins
- **Cod:** `lib/avx/{tiers,ledger}.ts`, `db/migrations/004_avx.sql`, `app/api/cron/avx`, `components/trips`
- **Invarianți:** câștig DOAR din cazarea netă (÷1.11) × tier%; praguri duale, 12 luni mobile, back-to-back merge; activare check-out+24h, expirare 12 luni; **cheltuire = decizia 24.08**: BRONZE–GOLD doar upsells 1:1, PLATINUM+ orice, cazare 2 AVX=1 RON; upsells niciodată gratuite. Orice schimbare a regulii cere confirmarea explicită „X bate decizia din 24.08?".
- **Stadiu:** ✅ motor + UI live. Rămas: notificare expirare -30 zile (❌), anulare proporțională monede la refund parțial (❌), redemption la plată (⏳ 10.09).

## Z5 · Auth & zona de membru
- **Cod:** `app/(auth)`, `app/(member)`, `components/{auth,profile}`, `lib/supabase`
- **Invarianți:** identitatea DOAR din sesiunea Supabase server-side, niciodată din client; RLS pe toate tabelele; parole/plăți nu se ating în clar.
- **Stadiu:** ✅ login/signup/reset + My Trips + self-cancel cu refund automat. Rămas: guest checkout (M1.4/M3), check-in online (M4 ❌ — cel mai mare bloc).

## Z6 · API & trust boundary (SECURITATE)
- **Cod:** `app/api/**`, `.claude/rules/api-validation.md`, `next.config.ts` (security headers)
- **Invarianți:** input validat cu Zod pe orice route; secrete doar în env server; interne (`/api/sync`, `/api/cron`) cu Bearer; nu există `any`; CSP amânat conștient (de adăugat la hardening).
- **Modifici sigur:** endpoint nou = checklist-ul din regula api-validation, apoi `/adversarial-review` pe zona security.
- **Stadiu:** ✅ baza. Rămas: CSP + nonce (❌, hardening), rate-limiting pe endpoints publice (❌).

## Z7 · SEO & Performanță (obiective de produs, nu nice-to-have)
- **Cod:** metadata per pagină, `components/seo/JsonLd.tsx`, `app/{sitemap,robots}`, imagini
- **Invarianți:** 1 h1/pagină, title <60, description <155, canonical; JSON-LD valid; keyword-ul principal pe home+locations; sub-2s mobil = regresiile sunt bug-uri; `images.qualities` allowlist.
- **Stadiu:** ✅ audit complet 23.08, totul verde (TTFB ~370ms). Rămas: re-măsurare LCP real pe mobil (🔶), hreflang RO/EN la versiunea română (⏳ după V3, per Vlad), sector CV2 de confirmat cu Anca (🔶).

## Z8 · Date & DB
- **Cod:** `db/{schema,migrations,seed}`, `lib/data/properties.ts` (overlay-uri!), `types/database.types.ts`
- **Invarianți:** catalogul din `lib/properties.ts` BATE conținutul stale din DB prin overlay-urile `withCatalogRate`/`withEditorialContent` — orice câmp nou de catalog se adaugă și în overlay, altfel producția îl pierde; migrările le rulează Robert manual în Supabase; `npm run db:types` după schimbări de schemă.
- **Stadiu:** ✅. Rămas: coloană dedicată cleaning_ron (🔶 amânat), migrare rate_plan 'standard' (🔶 amânat).

## Z9 · Infrastructură & Deploy
- **Cod:** `vercel.json` (cron), `.claude/hooks` (lint+typecheck pe commit, coming-soon blocat), branch-uri
- **Invarianți:** `main` = producție avexastays.com, NICIODATĂ push direct — PR + verde + merge; `feat/nextjs-platform` = preview; env nou în Vercel ⇒ redeploy; npm, nu pnpm.
- **Flux standard:** commit → push → `gh pr create` → checks verzi → merge → poll producție pe un marker real.
- **Stadiu:** ✅ rulat de ~10 ori azi fără incident. Rămas: M11 predare/ownership (⏳ „încă nu", per Robert 24.08).

## Z10 · Conținut & Legal
- **Cod:** paginile legale în `app/(marketing)`, `lib/policies.ts` (sursă unică anulare), `components/consent` (cookie consent)
- **Invarianți:** sursa cerințelor = documentele oficiale din Drive (Spec v1 + cele 19 documente legale AVX-01…19, briefing AVX-19); politica de anulare identică cuvânt cu cuvânt în checkout/T&C/FAQ; telefonul public UNIC +40 721 347 642 — numerele personale nu apar niciodată pe site; cookie policy = inventarul REAL din build (AVX-07).
- **Stadiu:** 🔶 texte proprii live, aliniate parțial; ⏳ montarea celor 19 documente oficiale (acces folder Drive în așteptare); ✅ cookie consent intern live (25.08): banner cu opțiuni egale, cookie unic `avexa_consent` 6 luni + Secure, revocabil din footer, /cookies = inventarul real; hărțile se afișează întotdeauna (decizia Robert 25.08 — risc ePrivacy rezidual asumat, de confruntat cu AVX-07). Tema mare transversală: back-office pentru conținut (❌ — decizie de arhitectură înainte de M4).

---
**Procesele care păzesc harta:** `/adversarial-review` (review pe zone, agenți care încearcă să spargă schimbarea) · `/stage-validate` (validarea completă a unei etape: cod + flow-uri de business + vizual) · fluxul de deploy din Z9. Stadiul se actualizează aici la fiecare etapă închisă.
