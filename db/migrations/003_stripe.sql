-- 003_stripe.sql — Stripe checkout support (RON-first money model)
-- Run in Supabase SQL editor after 002_hostaway.sql.
--
-- Context: bookings was schema-only until now (zero rows, no writers), so the
-- money columns are reshaped for the final model decided 2026-07-02:
-- RON is the money of record (charged via Stripe in RON; Hostaway reservation
-- records the same RON total). EUR/USD are display-only conversions.

begin;

-- ── Reshape bookings money columns ─────────────────────────────────────────
alter table public.bookings
  drop column if exists subtotal_ron,
  drop column if exists fx_rate,
  drop column if exists total_eur,
  drop column if exists member_discount_applied;

alter table public.bookings
  -- Guest split (Hostaway wants adults/children/infants; `guests` stays the
  -- taxable occupant count = adults + children).
  add column if not exists adults   integer not null default 1,
  add column if not exists children integer not null default 0,
  add column if not exists infants  integer not null default 0,
  -- Money (all RON, whole amounts produced by lib/pricing):
  add column if not exists accommodation_ron numeric(10,2) not null default 0,
  add column if not exists extras_ron        numeric(10,2) not null default 0,
  add column if not exists city_tax_ron      numeric(10,2) not null default 0,
  add column if not exists total_ron         numeric(10,2) not null default 0,
  -- Extras snapshot (name + RON each) until the services catalog is final:
  add column if not exists extras jsonb not null default '[]'::jsonb,
  -- What the guest was looking at when they paid (display-only context):
  add column if not exists display_currency text not null default 'EUR',
  add column if not exists display_fx_rate  numeric(10,4);

alter table public.bookings alter column currency set default 'RON';

-- ── Idempotency ─────────────────────────────────────────────────────────────
-- One booking row per (Checkout Session, property): webhook retries can never
-- double-insert. Composite so a future multi-room order (1 session → N rows,
-- distinct properties, shared order_id) stays valid.
create unique index if not exists bookings_stripe_session_property_key
  on public.bookings (stripe_session_id, property_id)
  where stripe_session_id is not null;

-- Fast-path dedupe of processed webhook deliveries (Stripe is at-least-once).
create table if not exists public.processed_stripe_events (
  event_id   text primary key,
  type       text not null,
  created_at timestamptz not null default now()
);

alter table public.processed_stripe_events enable row level security;
-- No policies: service-role (webhook) only — anon/authenticated get nothing.

commit;
