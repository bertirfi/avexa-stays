# Project notes

## Canonical files
- `app-v2.html` is the live homepage. The old `app.html` was deleted — never reference it.
- Note: the in-editor tab is sometimes mislabeled "checkout.html" when the user is actually on another page (e.g. the `#top` hero lives in `app-v2.html`). Infer the real file from the mentioned element / selector, not the tab label.

## Workflow preferences
- After making a fix, leave the user on the page that was actually edited. Do NOT redirect to checkout.html (or any unrelated page). Call `done`/`show_to_user` with the file I just changed.
