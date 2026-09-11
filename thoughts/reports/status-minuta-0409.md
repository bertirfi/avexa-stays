# Status Minuta 04.09.2026 — Observații Site și Rezervări

Raport de execuție, 11.09.2026. Legendă: **FĂCUT** = live pe avexastays.com · **RĂMAS** = nu ține de cod, revine echipei · **DE VERIFICAT** = implementat, așteaptă confirmare pe un caz real.

## 1. Probleme generale și setări site

| # | Cerință din minută | Status | Notițe |
|---|---|---|---|
| 1.1 | Butonul „Book now" mai mare | **FĂCUT** | Butonul plutitor din colțul dreapta-jos: de la ~122×44 px la ~180×56 px, text 18 px, halou alb pentru contrast. Aceeași poziție. Live din 10.09. |
| 1.2 | Taxa de oraș: „sistemul calculează fără zecimale, rotunjim în sus?" (@Vlad) | **FĂCUT + explicat** | În RON nu există zecimale: taxa = 10 lei × nopți × persoane (adulți + copii; bebelușii nu), mereu număr întreg. Zecimalele apăreau doar la conversia în euro, unde afișam două cifre diferite pentru aceeași linie („€11" și „≈ €11,43"). Acum taxa se afișează în RON real (ex. „60 RON") cu „≈ €11,43" alături. Nu e nimic de rotunjit. |
| 1.3 | Cum a calculat Claude prețul pentru Modern Green, 2–4 dec, 2 adulți + 1 copil | **FĂCUT** | Verificat pe producție: noaptea 2 dec 246 × 1,21 = 297,66 → 298 lei; noaptea 3 dec 271 × 1,21 = 327,91 → 328 lei (rotunjire în sus per noapte); cazare 626 + curățenie 150 + taxa de oraș 10 × 2 × 3 = 60 → **836 lei**. Diferențele de câțiva lei din calculele de mână (ex. 918 vs 911,8 la C5) vin din prețurile Hostaway diferite de la o noapte la alta, nu dintr-o eroare de calcul. |
| 1.4 | Email de confirmare check-in de pe office@avexastays.com; se primeau două emailuri identice (Hostaway + ChargeAutomation) | **FĂCUT (cod) / DE VERIFICAT** | Mesajul cu linkul de check-in ChargeAutomation pleacă acum prin Brevo de la office@avexastays.com, nu prin conversația Hostaway. Dacă mai sosește o copie de la ChargeAutomation, aceea e automatizarea CA și se dezactivează din contul CA pentru canalul direct/website (Vlad). De verificat la următoarea rezervare reală. |
| 1.5 | Galeria foto: swipe, nu doar butoane | **FĂCUT / DE VERIFICAT** | Swipe stânga/dreapta în galeria pe ecran întreg (lightbox), pe toate apartamentele; butoanele, săgețile și zoom-ul rămân. Testat cu evenimente simulate; merită o încercare pe un telefon real. Pe mobil, galeria de pe pagină e o singură poză + „Show all photos" — swipe-ul e în lightbox. |
| 1.6 | Poze noi pentru homepage | **RĂMAS** | Conținut — Anca/Vlad. Se montează când sunt gata. |
| 1.7 | Verificare upsell în My Trips (Anca) | **RĂMAS** | Test de făcut de Anca după o rezervare nouă. |
| 1.8 | La „Cancel my trip" perioada a rămas blocată în Hostaway | **FĂCUT / DE VERIFICAT** | Cauza găsită: la anulare, codul **ștergea** rezervarea din Hostaway (DELETE) în loc s-o **anuleze**; Hostaway eliberează calendarul doar la anulare. Acum folosim exact comanda documentată „Cancel a reservation". De confirmat la prima anulare reală că datele se eliberează singure, fără intervenție manuală. |
| 1.9 | Curățenia inclusă în prețul afișat, doar taxa de oraș extra | **FĂCUT** | Peste tot unde vede clientul (card cu date, pagina apartamentului, checkout, emailul de confirmare, pagina de plată Stripe): o singură linie „Accommodation · N nights" care include curățenia; nu mai apare nicăieri „Cleaning fee". Lista per noapte împarte curățenia egal pe nopți, ca cifrele să se adune exact. Doar taxa de oraș rămâne separată. Sumele încasate, refund-urile și defalcarea din Hostaway (pentru contabilitate) nu s-au schimbat cu niciun leu. |

## 2. Observații pe proprietăți

| # | Cerință | Status | Notițe |
|---|---|---|---|
| 2.1 | Modern Green: canapea → pat dublu 150×190 | **FĂCUT** | Adăugat în descriere: „The sofa converts into a comfortable 150×190 cm double bed, a great fit for very tall guests." |
| 2.2 | Modern Green: recenzii mai noi | **RĂMAS** | Nu putem inventa recenzii. Trimiteți 3–5 recenzii reale recente (text + prenume + luna) și le montăm. |
| 2.3 | Modern Green: check-in 15:00 flexibil, check-out oricând până la 11:00 | **FĂCUT** | Afișat pe pagină și în FAQ-ul apartamentului. |
| 2.4 | Parcare Calea Victoriei 142-148: fără gratuit, 30 lei/zi sau 5 lei/oră + taxe, gratuit 20:00–08:00, Amparcat / ParkingBucuresti | **FĂCUT** | Actualizat pe toate cele 5 apartamente din clădire (102, 202, 301, 302, 303); mențiunile „free street parking" au fost eliminate. |
| 2.5 | Modern Sapphire | — | Fără cerințe în minută. |
| 2.6 | Modern Oak: poza de la baie din perioada renovării | **RĂMAS** | Poză nouă de la Anca/Vlad; o schimbăm imediat ce o avem. |
| 2.7 | Modern Oak: „dryer" greșit în descriere, e mașină de spălat | **FĂCUT** | Descrierea spune acum „washing machine"; am scos „dryer" și din lista de facilități, ca să fie consecvent. |

## 3. Făcute în plus în aceeași perioadă (nu erau în minută)

- **Rezervare fără cont (guest checkout)** — decizie Robert 04.09: doar nume + email + telefon, cu dezavantajele afișate clar înainte de plată (non-refundable, fără AVX, fără My Trips) și buton „Join free". Live.
- **Punctele AVX vizibile imediat după plată** în My Trips (activabile după check-out + 24h, ca în regulă); anularea le anulează. Pagina My Trips arată întâi șederile, apoi portofelul.
- **Protecție anti-abuz** pe calculul de preț și checkout: limită în cod + regulă Vercel Firewall (30 cereri/minut per IP) — verificată live.

## 4. Ce așteptăm de la echipă

1. O rezervare reală + anulare din My Trips, ca să confirmăm: calendarul Hostaway se eliberează singur, emailul de check-in vine o singură dată, de pe office@.
2. Poze: homepage, baia de la Modern Oak.
3. Recenzii recente pentru Modern Green.
4. Dezactivarea automatizării ChargeAutomation pentru canalul direct, dacă emailul dublu persistă.
5. Testul de upsell (Anca).
