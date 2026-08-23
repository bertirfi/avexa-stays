-- 004_avx.sql — AVX Coins ledger (Spec M2, resolved 2026-08-23)
-- Run in Supabase SQL editor after 003_stripe.sql. Robert runs this manually;
-- all code paths degrade gracefully (feature dark) until it has run.
--
-- Model: append-only ledger. 'earn' rows are FIFO tranches (remaining tracks
-- the unspent part); 'spend'/'expire'/'revoke' rows carry negative amounts.
-- Writes are service-role only (no insert/update policies on purpose).

begin;

create table public.avx_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id),
  type text not null check (type in ('earn', 'spend', 'expire', 'revoke')),
  amount integer not null,            -- positive AVX for earn; negative for spend/expire/revoke
  remaining integer,                  -- earn rows only: unspent part of the tranche (FIFO)
  tier text,                          -- earn rows: tier label at earn time
  percent numeric,                    -- earn rows: percent applied
  activates_at timestamptz,           -- earn rows: check_out + 24h (M2.4.1)
  expires_at timestamptz,             -- earn rows: activates_at + 12 months (M2.4.2)
  note text,
  created_at timestamptz not null default now()
);

create index avx_ledger_user_created on public.avx_ledger (user_id, created_at desc);

-- One earn per booking, ever — makes the cron idempotent.
create unique index avx_earn_once_per_booking
  on public.avx_ledger (booking_id) where type = 'earn';

alter table public.avx_ledger enable row level security;

-- Members read their own ledger; writes are service-role only (no policies).
create policy avx_select_own on public.avx_ledger
  for select using (auth.uid() = user_id);

commit;
