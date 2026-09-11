# AVEXA — Raport lectură Drive (11.09.2026)

Ce am citit integral: folderul legal (22 documente AVX-00…AVX-19 + AVX-13S + AVX-STRAT-01, v3.2, în vigoare 1.09.2026) și folderul de status (STATUS Berty 07.09, Minuta 23.08, Master v3, Specificația Berty v1, Raport Status v2). Textele complete sunt salvate local pentru montare verbatim. Partea de CRM (facturare, curățenie, mentenanță, KPI, Igloohome, registru conformitate) este notată doar ca „CRM", nu intră în site.

Regula de autoritate din documente: AVX-19 (Implementation Brief) spune „work exclusively from this document" și înlocuiește practic Specificația v1 pe partea legală/upsell/AVX. Unde AVX-19 și Spec v1 diferă, am luat AVX-19 (mai nou, aprobat de Vlad pe 25/30/31.08).

---

## 1. Upsells / servicii extra — ce cer documentele

Catalog FINAL v1 (AVX-08 + decizia D21), prețuri în RON cu TVA inclus, per sejur, „introductory, reviewed quarterly":

| Serviciu | Preț | Lead time |
|---|---|---|
| Early check-in (de la 13:00) | 119 | 24h, „subject to availability" |
| Late check-out (până la 13:00) | 119 | seara dinainte, „subject to availability" |
| Time & Cravings (early + late + tavă gustări) | 259 | 24h |
| Mid-journey Cleaning | 99 / 129 / 149 după nr. camere | 24h |
| Deep Sleep & Recovery | 169 | 24h |
| Cinema Cravings | 139 | 24h |
| Family Travel Light | 129 / sejur | 24h |
| Premium Self-Care | 169 | 24h |
| Surprise Setup | 229 | 72h |
| Romanian Keepsake | 169 | 24h |

Reguli care contează pentru site:
- Se cer prin My Trips (sau WhatsApp). Pachetele se livrează o singură dată, la sosire, fără re-stocare.
- Anulare gratuită până la lead time; după, se taxează integral dacă a fost deja pregătit.
- Plata cu AVX: de la Silver, 1 AVX = 1 RON pentru toate cele 10 (D24). Bronze doar acumulează. Platinum/Diamond pot plăti și cazarea la 2 AVX = 1 RON.
- Scoase definitiv (D16, D18): airport transfer, parcare, asistență sosire târzie, curățenie gratuită mid-stay. Breakfast nu există în catalog.
- Tarifele AVX-08 trebuie afișate pe pagina fiecărui apartament (Block D).
- Coins nu se câștigă pe upsells (doar pe cazarea netă).

## 2. Ce are site-ul azi (verificat în cod)

- Un singur „extra" implementat: Breakfast (nu e în catalog). Early/late check-in există ca date dar UI-ul e ascuns (`UPGRADES_ENABLED = false`).
- Tabelele `services` / `booking_services` din DB există dar nu sunt folosite. Booking-ul stochează `extras` jsonb + `extras_ron` și Stripe primește câte o linie per extra — plumbing-ul e bun, lipsește catalogul.
- My Trips: nu există nicio secțiune de servicii extra (nici afișare, nici cumpărare). FAQ-ul promite „request via My Trips" — promisiune neacoperită.
- Breakdown checkout: linia e hardcodată „Extra services · Breakfast".
- Vault-ul AVEXIAN (My Trips + Member benefits + `lib/avx/tiers.ts`) listează încă „24/7 Parking, Airport Transfer, Luggage Drop, Mid-stay Cleaning" gratuit etc. — contrazice D16/D18/D24.

## 3. Ce implementez acum (upsells)

1. Catalog static cu cele 10 servicii din AVX-08 (preț, lead time, slot pentru imagine — momentan fără imagini).
2. Pagina apartamentului: secțiune „Elevate your stay" cu cardurile serviciilor (preț, ce include) + selectabile din sidebar înainte de rezervare; Mid-journey Cleaning cu prețul după numărul de camere al apartamentului.
3. Checkout: breakdown-ul afișează fiecare serviciu selectat pe linia lui; Stripe primește o linie per serviciu; emailul de confirmare le listează.
4. My Trips: pe fiecare sejur viitor, serviciile deja adăugate (cu status) + „Add to your stay" cu serviciile încă disponibile după lead time; plata printr-o sesiune Stripe separată; după plată se atașează la rezervare și primiți email pe office@.
5. Vault/Member benefits realiniate la D16/D18/D24 (fără transfer/parcare/curățenie gratuită; toate cele 10 deblocate de la Silver).

Presupuneri (spune-mi dacă vrei altfel):
- Early check-in / Late check-out sunt „subject to availability": le vând ca cerere plătită, cu text „confirmed by our team within 48h; full refund if we cannot honour it" (regula din AVX-09 + SOP 5.3). Nu verific automat calendarul vecin (asta e în CRM).
- Plata cu AVX Coins pentru upsells NU o fac acum (blocată pe decizia contabilei din 10.09 — TVA pe upsells, CT2). Doar cash.
- Oaspeții fără cont (guest checkout) pot alege servicii la rezervare; după rezervare nu au My Trips, deci folosesc WhatsApp (cum spune AVX-08).
- La anularea întregii rezervări, serviciile urmează același procent ca cazarea (100/50/0). AVX-02 nu le tratează separat.

## 4. Documente legale — observații de STRUCTURĂ (nu de text)

Textul nu îl modific. Iată ce nu se leagă logic între documente:

1. **AVX-19 se contrazice singur pe AVX Coins.** D24 spune „toate cele 10 servicii se deblochează la Silver". Block G spune „Bronze/Silver/Gold doar pe upsells în categoriile deblocate (Silver flexibility, Gold comfort, Platinum executive)" — modelul vechi pe categorii. Și AVX-11 spune că Bronze NU cheltuie, Block G îl include. Am mers pe D24 + AVX-11 (mai noi, 01.09).
2. **Creditarea AVX: 72h vs 24h.** AVX-11 §earning + AVX-19 Block G: „credited 72h after check-out". Minuta/decizia Vlad 24.08 și site-ul: 24h după check-out. Trebuie o singură valoare — recomand să confirmi 72h (e în documentul public AVX-11) și schimb constanta.
3. **AVX-00 vs AVX-STRAT-01 pe prețurile AVX-08.** AVX-00 le marchează FINAL (D21); STRAT-01 §4 le listează încă drept „the only empty content field". Aceeași versiune, aceeași dată. AVX-08 are prețurile, deci STRAT-01 e rămas în urmă.
4. **AVX-05 §1 spune „the following four documents" și listează cinci** (01, 02, 03, 04, 06). Și §4 citează AVX-12, care nu apare în lista din §1.
5. **AVX-02 §2 vorbește despre guest checkout la viitor** („once guest checkout without an account opens") — pe site e deja live din 04.09 (non-refundable, exact cum cere D2). Doar formularea e stale.
6. **AVX-01 §4 vs AVX-02/AVX-08 pe taxa de oraș:** „collected at check-in if not shown as included". Pe site taxa se încasează online, la rezervare, întotdeauna. Documentele acoperă ambele cazuri, deci nu e o contradicție, dar formularea „if not included" nu se aplică niciodată la rezervările directe.
7. **AVX-11 nu spune explicit că oaspeții fără cont nu intră în program** (doar „membership required for direct online booking", care nu mai e adevărat după guest checkout).
8. **AVX-15 (registrul GDPR) nu listează Supabase, Vercel, Brevo, Resend** ca procesatori, deși sunt infrastructura reală a site-ului. AVX-06 numește doar Stripe. AVX-07 spune corect „no analytics" (așa e și pe site).
9. **AVX-13 (manualul RO):** SOP 5.4 „Managementul Recenziilor" apare de două ori aproape identic; SOP 3.3 și 3.4 sunt anunțate în cuprins dar nu au corp; footer-ul spune încă „v2.0"; tabelul de mesaje are ore contradictorii cu textul (link check-in 3 zile vs 1 zi; instrucțiuni check-out 18:00 vs 11:00; review +24h vs +2h) și note de autor rămase în celule („CUM???", „Eu tot le trimit"); „Hostaway/Guesty" apare de două ori deși PMS-ul e doar Hostaway.
10. **AVX-13S** citează SOP 5.2/5.3 ca „governed by AVX-16/AVX-08" dar păstrează textul vechi în același paragraf.
11. **AVX-00** spune „22 documents" dar tabelul are 23 de rânduri (AVX-13S a fost adăugat ulterior).
12. **AVX-16 M1** pentru rezervări directe spune „email + SMS with link" — SMS-ul nu există pe site (nici în Spec ca livrabil site).

Nimic din cele de mai sus nu blochează montarea pe site; punctele 1 și 2 cer o decizie a lui Vlad pentru că schimbă cod.

## 5. Status site (ce e făcut / ce rămâne) — doar ce ține de Berti

Sursa: AVX-19 blocuri A–I + Spec v1 M1–M12 + STATUS Berty 07.09, verificat în cod azi.

### Făcut (live)
- M1 site public, prețuri Hostaway +21%, curățenie 120/150/180 afișată separat în breakdown, taxa oraș 10 RON/noapte/persoană în RON, defalcare pe nopți, „punct și de la capăt", nume complete gazde, /about, JSON-LD brand.
- M3 Stripe checkout (card/Apple/Google Pay), guest checkout non-refundable, membru 100/50/0 la 72h/24h cu taxa de oraș returnată integral (= D2), două bife obligatorii la checkout, număr oaspeți blocat, refund automat la anulare.
- M2 motor AVX: praguri duale, back-to-back merge, BASIC→BRONZE, coins vizibile imediat după plată (pending până la activare), revocare la anulare, expirare 365 zile în ledger, wallet + AVEXIAN Meter + Vault în My Trips.
- Email confirmare din office@ prin Brevo; email check-in cu link ChargeAutomation din office@.
- Cookie consent (Accept all / Only essential / Settings, link în footer) — AVX-07 îl oglindește (D22).
- WAF rate limit, un singur telefon public, harta Google reală.

### Rămâne — fac ACUM în acest sprint
- **Block H (S1, „immediately")**: scot AMEX din footer și checkout; „exactly 24 hours before you arrive" → formularea hibridă D3; „24/7" → „Fast human support on WhatsApp" (D19) peste tot; scot transfers/parking/late-night/mid-stay clean din Benefits 05, Member benefits, Vault (D16/D18); scot link-ul ODR + fraza de arbitraj din /imprint și /terms (Block A ziua 1).
- **Block A**: montez verbatim AVX-01, 02, 03, 06, 07, 08, 09, 10, 11 (EN) cu data „in force" pe pagină; URL permanent pe versiune (`/terms/v3-2`) cu pagina curentă arătând versiunea. House Rules (AVX-04) și Terms of Stay (AVX-05) sunt CHK — le montez ca pagini pentru bifa de la checkout („Rental Agreement + House Rules"), pentru că azi bifa trimite la /terms.
- **Block D parțial**: tarife AVX-08 pe pagina fiecărui apartament + linia „Classification: application submitted — pending with the authority" (D7) cu câmp pregătit pentru numărul certificatului.
- **Upsells** (secțiunea 3).

### Rămâne — după decizii / alt sprint
- Creditare AVX la 72h vs 24h (decizie Vlad).
- Plata cu AVX Coins la checkout și pe upsells (după contabilă, CT2/TVA; Spec M2.4.4).
- Block I monedă: D11 cere RON implicit (site-ul are EUR implicit) și cursul BNR ziua anterioară +1% înghețat la rezervare și logat per tranzacție. Azi: EUR implicit, curs din env (AVEXA_FX_RATE_*) fără +1%. E schimbare de produs — o fac după confirmarea ta, e o zi de lucru.
- Block E: log de consimțământ server-side (azi consimțământul e doar în cookie) — mic, îl pot adăuga.
- Block A limba RO: după avizul avocatului (D4).
- Versiuni RO/EN cu switch de limbă (D4) — nu există i18n pe site; e proiect separat.
- Block D: alias email per unitate (DNS/Brevo, nu cod); numere certificate (când vin de la autoritate).
- M12 etapa 3 (31.10): AVX slider, Unlock Door, AI Local Guide, Wallet pass, mascota, social proof, secțiunea Partnership.
- M11 predare/ownership + clauza IP (decizia lui Robert 24.08: „încă nu").
- SMS la confirmare (AVX-16 M1) — nu e în Spec ca livrabil, de decis dacă rămâne.
- Poze (Anca): hero, Modern Oak baie, Piața Romană; descrieri de confirmat final de Vlad.

### CRM (nu site) — doar ca să fie clar că NU sunt ale site-ului
Block B check-in compliant (Avexa Automation), Block C export taxa oraș, Block F registru conformitate, M5 e-Factura, M6–M10. Când Avexa Automation e gata, pe site schimb doar sursa link-ului de check-in (azi regex pe link ChargeAutomation din notele Hostaway, în `lib/hostaway/confirmation.ts`) — pregătesc un switch prin env ca să nu fie nevoie de cod atunci.

## 6. De clarificat cu Vlad/Anca

1. Creditare AVX: 72h (documente) sau 24h (site)? Până la răspuns rămâne 24h în cod.
2. Upsells la rezervare: e ok să se poată cumpăra și la checkout, nu doar din My Trips? (Așa am înțeles din „price breakdown să arate serviciile extra".)
3. Early/Late: „subject to availability" — acceptăm modelul „plătește → confirmăm în 48h → refund integral dacă nu putem"?
4. Moneda implicită RON (D11) — schimbăm acum? Afectează tot site-ul (azi EUR).
5. Punctele structurale 1, 3, 4, 11 din secțiunea 4 — de corectat în documente înainte de avocat.
6. ~~Mid-journey Cleaning pe camere~~ — lămurit cu Robert 11.09: prețul urmează mărimea apartamentului ca la curățenie (120/150/180 → 99/129/149), exact ca în AVX-08.
