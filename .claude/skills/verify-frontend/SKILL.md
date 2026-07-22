---
name: verify-frontend
description: Self-verify a UI change actually works in a real browser before calling it done — open the running app, exercise the change, assert the user-visible result, check the console, test mobile + desktop, iterate until clean. Use after any frontend change or when asked "does it actually work?". Never treat "the edit applied" as proof.
---

# Frontend verification loop

Applying an edit is not verification. Prove the change works the way a user sees it, and loop until every check passes.

## Where to run
- **Full-feature checks (maps, auth, live pricing):** the Vercel **preview** for `feat/nextjs-platform` — env vars are set there (local `.env.local` has no Maps key). Preview: `https://avexa-stays-git-feat-nextjs-platform-berti8.vercel.app`.
- **Pure UI/layout checks:** `npm run dev` → `http://localhost:3000` is faster.

## Browser tool
Use gstack **/browse** for all browser work (global rule: never use claude-in-chrome). Useful commands: `$B goto <url>`, `$B viewport <w> <h>`, `$B screenshot`, `$B console --clear`, `$B console --errors`, `$B snapshot -i`, `$B click @ref`, `$B hover @ref`, `$B js "<expr>"`.

## The loop
1. **Open the exact route you changed** (`$B goto <url>`), not just the code.
2. **Clear the console** (`$B console --clear`) so you only see output caused by your action.
3. **Exercise the change directly** — click the button / open the map / submit the form / follow the link. Capture a **before + after screenshot** for interactions.
4. **Assert the real, user-visible result** by reading the DOM (`$B snapshot -i` / `$B js`), not by assuming: element appears, navigation lands on the right URL, price updates, popup opens.
5. **Console must be clean** — `$B console --errors` shows zero new errors/warnings from your change.
6. **Check both breakpoints** for anything layout-affecting — mobile `375×812` and desktop `1280×800`. On mobile, tap targets ≥ 44px, no horizontal scroll (Airbnb parity).
7. **On any failure, fix and rerun from step 1.** Never hand back partially verified work.

## Done means
The user-visible result is correct in the browser, the console is clean, and it holds at mobile + desktop. Report the evidence (routes hit, what you clicked, screenshots, console state) — not "the code looks right".
