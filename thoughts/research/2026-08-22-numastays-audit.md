# Audit numastays.com + plan aplicare AVEXA (22.08.2026)

Raport complet (cu capturi): artifact „Auditul Numa Stays" — https://claude.ai/code/artifact/c51060e9-9496-48ca-876b-3e39aeae181f
Surse de cerințe: Drive AVEXA → `AVEXA_IT_Specificatie_Berty_v1.docx` (singura sursă de implementare), `AVEXA_IT_Master_v3.docx` (registrul de decizii D1–DX7), `AVEXA_Raport_Status_v2.docx` (blocuri A–G).

## Concluzii numa (verificate live, desktop 1280 / tabletă 768 / mobil 375)
- Ierarhie: Țară → Oraș → Cartier → **Clădire („house")** → tipuri de camere. URL: `/locations/germany/berlin/prenzlauer-berg/torstrasse`.
- Pagina de oraș: hartă cu 1 pin/clădire + carduri clădire („7 stay types · from €70/night") + listă plată a tuturor camerelor cu filtre/sort.
- Prețuri: fără date → „from €79/night" pe fiecare card; cu date → „**€457 total** · 1 guest, 3 nights, €153 night" direct pe card; datele intră în URL (`?arrival=&departure=`). Indisponibil → cardul rămâne cu „Change the date".
- Mobil: card compact cu preț vizibil imediat (nu la finalul paginii), pastilă search sticky sus, tab-bar jos ca de app. Tabletă: grilă 2 coloane + aceeași pastilă sticky.
- Fără cont: checkout cere doar email+nume+telefon; login = doar autofill. Toggle preț „Show member prices" ↔ „standard — book instantly, no signup needed". Rate: Flexible/Non-refundable, Pay Now/Pay Later.
- NU copiem: popup modal de membru pe fiecare pagină, cookie wall modal, mesaje de discount procentual.

## Aplicare AVEXA
- Câmp `building` pe proprietăți (CV142, CV2, Coltei 25, Polona 115, GF2) — maparea exactă o dă Robert. /locations grupat pe clădiri, pin/clădire pe hartă, secțiune „În aceeași clădire" pe pagina apartamentului (sibling data există în StayBookingSidebar). Faza 2: pagini de clădire (SEO local, aliniat cu cele 5 fișe Google Business din N8).
- Mobil: preț pe card mereu + total după selecție; bară sticky jos cu total+Book pe pagina apartamentului; defalcarea completă doar la checkout (M1.1.5).

## Inventar M1.2 (task B1, P0 — mesajele de pe live)
Fișiere de modificat: `components/member-benefits/{MemberStatement,MemberPerks,MemberCompare,MemberReward,MemberFAQ}.tsx`, `app/(marketing)/member-benefits/page.tsx` (meta), `components/sections/Benefits.tsx`, `components/sections/Editorial.tsx` („Six neighborhoods"), `components/auth/LoginForm.tsx`, `lib/properties.ts`, `components/chrome/Footer.tsx` (PayPal de scos dacă nu e activ în Stripe — M1.2.6), `app/(marketing)/cancellation/page.tsx` + `faq/page.tsx` (grila DX7, early/late devin upsells).
Acceptare: full-text search pe „discount", „% off", „No tiers" → zero rezultate.

## Back-office (principiul universal din Spec: tot conținutul editabil)
Recomandare: admin propriu pe Supabase (tabele `content_blocks` + tabele structurate: upsells, FAQ, politici, mesaje automation) în CRM, site-ul citește cu ISR on-demand revalidation. NU CMS extern (al doilea login + cost), NU editare prin GitHub, NU Telegram-bot pe cod (ok doar ca strat conversațional peste API-ul adminului, mai târziu).

## Predare Vlad (F3–F8, 31.08) + template
- GitHub org „avexa" cu Vlad Owner, Robert membru; Vercel team transfer; DNS; inventar chei + rotire după predare; document pe module.
- ⚠️ IP: M11.5 dă proprietate exclusivă integrală către Prime Gold Living. Planul de template/SaaS al lui Robert cere clauză de background IP în contract (înainte de 25.08): foreground (tot ce e AVEXA) exclusiv la Vlad + licență perpetuă/transferabilă pe motorul generic; Robert păstrează dreptul de reuse pe componentele generice. Fără clauză → nu există reuse legal.
