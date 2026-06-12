# Database — Supabase

## Applying migrations

**Option A — Supabase Studio (fastest):** open the project → SQL Editor →
paste the contents of `migrations/001_init.sql` → Run. Apply migrations in
numeric order, each exactly once.

**Option B — Supabase CLI:**
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

## Regenerating TypeScript types

After any schema change:
```bash
npm run db:types   # requires CLI login + link (Option B above)
```
Until the CLI is linked, `types/database.types.ts` is maintained by hand and
must be kept in sync with the migrations.

## Conventions

- All prices from Hostaway are stored in **RON** (`price_ron`, `subtotal_ron`).
- EUR conversion happens at display/charge time via `lib/fx.ts` (BNR daily
  rate + 3% margin, per-night amounts rounded up to whole EUR).
- `bookings.order_id` groups multi-room bookings (one payment, N reservations).
- `rate_plan` values are neutral (`non_refundable` / `flexible`) — marketing
  names live in the UI layer only (final naming pending, spec §10).
- All writes go through the service-role client server-side; RLS exposes
  read-only catalog data and owner-only user data.
