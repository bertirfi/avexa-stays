---
paths:
  - "app/api/**"
---
# API route handlers — trust boundary

Everything under `app/api/**` is a server trust boundary. Never trust the client.

- **Validate every input with Zod** before processing (body, query, params). Reject invalid input with a 400 and a safe error message — do not act on unparsed data.
- **Derive identity from the validated Supabase session** (`getSupabaseServerClient().auth.getUser()`), never from a client-supplied user id, email, or a localStorage mirror (`loggedIn`, etc.). The client mirror must never gate money or authorization.
- **Verify webhook signatures** (Stripe `whsec_...`, Hostaway) before doing any work in `webhooks/**`. Return 400 on signature failure.
- Use the **service-role Supabase client only server-side**, and only where RLS genuinely must be bypassed. Prefer the anon/session client so RLS applies.
- Return correct status codes (400 invalid, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict). Never leak secrets, stack traces, or internal IDs in responses.
- Keep handlers idempotent where they create side effects (bookings, reservations) — a retried webhook must not double-book.
