---
name: stage-validate
description: Validarea completă a unei etape de dezvoltare înainte de merge pe producție — cod, flow-uri de business pe browser, vizual pe 2 viewport-uri, SEO spot-check, apoi adversarial-review pe diff. Se invocă la finalul fiecărei etape incrementale; la final actualizează ZONES.md și LEARNINGS.md.
---

# Stage Validate — poarta de calitate a fiecărei etape

Dezvoltarea e incrementală: o etapă = un diff coerent pe `feat/nextjs-platform`. Nimic nu trece spre `main` fără această poartă. Pașii rulează în ordine; un pas picat se repară și se reia de la pasul picat.

## 1 · Cod (rapid, mecanic)
```bash
npm run lint
npm run typecheck
```
Ambele curate, fără excepții (hook-enforced oricum la commit).

## 2 · Flow-uri de business (browser, pe dev server via gstack browse)
Rulează DOAR flow-urile atinse de etapă + întotdeauna F1. Gotcha: `console --clear` înainte de fiecare `goto`.

- **F1 — Sanity global:** home, /locations, o pagină de apartament, /member-benefits, /faq → zero erori consolă, zero 4xx/5xx, un singur h1/pagină, fără overflow orizontal la 375px.
- **F2 — Căutare → listing:** dată+oaspeți pe /locations → carduri filtrate, clădiri goale ascunse, „from €X /night" pe carduri, total pe interval când există dată.
- **F3 — Pagina de apartament:** dată auto-selectată (prima liberă luna următoare, min-stay respectat) cu total imediat; popup preț cu defalcare per noapte; suma liniilor = totalul; curățenie separată (120/150/180) + „not included"; acordeoanele se deschid/închid.
- **F4 — Checkout (până la Stripe):** logat → quote-ul live = prețul afișat (sau banner „Prices were refreshed"); taxa oraș 10×nopți×pers linie separată; cele două bife obligatorii blochează plata; „11% VAT included".
- **F5 — Anulare (logică, nu click-uri):** verifică în cod/test că refund = taxa_oraș×100% + (total−taxa)×{100/50/0} pe pragurile 72h/24h ancorate 15:00 Bucharest wall-time.
- **F6 — AVX:** regulile afișate = decizia 24.08 (BRONZE–GOLD upsells 1:1; PLATINUM+ orice, cazare 2:1; zero promisiuni de gratuitate); wallet/meter/vault randate corect pe un cont cu date.
- **F7 — Copy global:** grep pe HTML-ul randat: zero „discount", „% off", „No tiers", zero numere de telefon personale (0755/0766), doar +40 721 347 642 și office@avexastays.com.

## 3 · Vizual
375×812 și 1280×800 pe paginile atinse: capturi, comparate cu ochiul pe: suprapuneri, sentence-per-line, contrast (text mic pe ink = white/55+). Capturile relevante se trimit utilizatorului.

## 4 · SEO spot-check (dacă etapa a atins pagini publice)
title/description/canonical pe paginile atinse; JSON-LD parsabil; sitemap-ul include paginile noi.

## 5 · Adversarial review
Invocă `/adversarial-review` pe diff-ul etapei (zonele din ZONES.md). Blocker = stop, repară, reia de la pasul 1.

## 6 · Închiderea etapei
1. Commit(e) conventional + push → PR spre `main` cu descriere în română → checks verzi → merge → poll pe producție pe un marker REAL al schimbării (nu presupune; verifică).
2. **Actualizează `ZONES.md`** — stadiul zonelor atinse (✅/🔶/❌/⏳ + datoriile noi).
3. **Actualizează `LEARNINGS.md`** — intrare de sesiune: ce s-a livrat, gotcha-uri noi, decizii de client cu dată.
4. Raport către Robert: ce e live (cu dovezi), ce a rămas, ce decizii așteaptă.
