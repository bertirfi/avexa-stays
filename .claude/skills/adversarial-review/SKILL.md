---
name: adversarial-review
description: Review adversarial multi-zonă pe o schimbare (diff/PR/feature) — agenți independenți, câte unul pe zonă afectată, fiecare încercând să SPARGĂ schimbarea; verdictele se verifică înainte de raport. Se invocă înainte de merge pe orice schimbare non-trivială.
---

# Adversarial Review — pe zonele din ZONES.md

Scop: nicio schimbare non-trivială nu ajunge pe producție validată doar de autorul ei. Agenți independenți, fiecare cu o singură lentilă, încearcă activ să demonstreze că schimbarea e greșită. Ce supraviețuiește e solid.

## Procedură

1. **Stabilește ținta**: diff-ul curent (`git diff main...HEAD` sau working tree) sau PR-ul indicat.
2. **Citește `ZONES.md`** și decide ce zone atinge schimbarea (fișierele din diff → zonele lor). Minim zona principală + Z6 (securitate) dacă e atins vreun API/input + Z2 (bani) dacă e atinsă vreo sumă.
3. **Lansează în paralel câte un agent per zonă afectată** (model: `sonnet` pentru zone mecanice, `opus`/`fable` pentru bani/securitate/user-facing). Prompt-ul fiecăruia:
   - primește diff-ul + invarianții zonei lui din ZONES.md + regulile din `.claude/rules/` relevante;
   - instrucțiune explicită: „Încearcă să REFUZI această schimbare. Caută: invarianți încălcați, cazuri limită (gol/negativ/duplicat/concurent/DST/rotunjiri), regresii în alte call-site-uri (grep TOATE apelurile funcțiilor atinse), scenarii în care utilizatorul pierde bani sau date. Dacă nu găsești nimic, spune explicit ce ai verificat și n-a picat.";
   - format de retur: constatări cu file:line + scenariul concret de eșec, sau „curat, verificat: …".
4. **Verifică verdictele** (orchestratorul, nu agenții): pentru fiecare constatare, deschide fișierul citat și confirmă că e reală — agenții raportează piste, nu adevăruri. Constatările plauzibile dar neconfirmate se marchează ca atare.
5. **Raport final**: constatări confirmate (severitate: blocker / important / cosmetic), ce s-a reparat pe loc, ce s-a amânat conștient. Blocker nereparat = NU se face merge.

## Zone → lentile (rezumat; detaliile în ZONES.md)
- Z2 Bani: sume, rotunjiri, per-noapte=total, refund-uri, race-uri de preț
- Z6 Securitate: input nevalidat, identitate din client, secrete, webhook fără semnătură
- Z3 Integrări: apel Hostaway din client, email care poate pica webhook-ul, env lipsă
- Z4 AVX: regula 24.08 încălcată, praguri, merge back-to-back, expirări
- Z1/Z7 UI+SEO: contrast, sentence-per-line, h1 unic, metadata, regresii mobile
- Z8 Date: câmp de catalog fără overlay, migrare nerulată presupusă rulată

## Reguli
- Agenții NU editează — doar raportează. Reparațiile le face orchestratorul sau un agent de fix separat, apoi zona picată se re-review-uiește.
- Un review „curat" spune CE s-a verificat, nu doar „ok".
- Constatările confirmate care nu se repară acum intră în ZONES.md la stadiul zonei, ca datorie explicită.
