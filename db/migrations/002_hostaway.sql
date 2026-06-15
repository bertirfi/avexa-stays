-- AVEXA STAYS — Phase 5 Wave 1: Hostaway integration support
-- Apply in Supabase SQL Editor after 001_init.sql.

-- ── Cached integration tokens (Hostaway 24-month token) ────────────
-- Service-role only (RLS on, no policies) — tokens are secrets.
create table public.integration_tokens (
  provider text primary key,
  access_token text not null,
  token_type text not null default 'Bearer',
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.integration_tokens enable row level security;

-- ── Map our curated properties to Hostaway listing ids ─────────────
-- Hostaway listing names differ from AVEXA editorial names, so the link
-- is explicit. Robert fills these in (see /api/hostaway/diagnostic dump).
alter table public.properties add column hostaway_listing_id text unique;
create index properties_hostaway_listing_idx on public.properties (hostaway_listing_id);
