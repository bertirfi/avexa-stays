-- AVEXA STAYS — Phase 5 Wave 0: initial schema
-- Apply in Supabase SQL Editor (or `supabase db push` once CLI is linked).
-- Spec: /thoughts/plans/2026-06-12-phase-5-production-booking-platform.md §5

-- ── profiles (extends auth.users) ──────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'en',
  marketing_consent boolean not null default false,
  member_since timestamptz not null default now(),
  total_trips integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── buildings (groups sibling suites for multi-room booking) ───────
create table public.buildings (
  id text primary key,
  name text not null,
  address text not null,
  neighborhood_slug text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  created_at timestamptz not null default now()
);

-- ── properties (id = Hostaway listing id) ──────────────────────────
create table public.properties (
  id text primary key,
  building_id text references public.buildings (id),
  slug text unique not null,
  name text not null,
  subtitle text,
  neighborhood text not null,
  description text,
  -- amenities/FAQs/nearby/rates copy — preserves the frontend Property shape
  content jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  max_guests integer not null default 2,
  bedrooms integer not null default 1,
  bathrooms integer not null default 1,
  price_from_ron numeric(10, 2),
  active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index properties_neighborhood_idx on public.properties (neighborhood);
create index properties_active_idx on public.properties (active);
create index properties_building_idx on public.properties (building_id);

-- ── availability (synced from Hostaway calendar, prices in RON) ────
create table public.availability (
  property_id text not null references public.properties (id) on delete cascade,
  date date not null,
  available boolean not null,
  price_ron numeric(10, 2) not null,
  min_stay integer not null default 1,
  primary key (property_id, date)
);
create index availability_date_idx on public.availability (date);
create index availability_available_idx on public.availability (available);

-- ── exchange_rates (BNR daily, cron-fed) ───────────────────────────
create table public.exchange_rates (
  date date not null,
  currency text not null,
  rate numeric(10, 4) not null,
  fetched_at timestamptz not null default now(),
  primary key (date, currency)
);

-- ── services (extra services catalog; priced in EUR) ───────────────
create table public.services (
  id text primary key,
  name text not null,
  description text,
  price_eur numeric(10, 2) not null,
  unit text not null check (unit in ('per_stay', 'per_night', 'per_person', 'per_person_night')),
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── bookings (one row per room/Hostaway reservation; order_id groups multi-room) ──
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  user_id uuid not null references auth.users (id),
  property_id text not null references public.properties (id),
  hostaway_reservation_id text,
  check_in date not null,
  check_out date not null,
  guests integer not null,
  rate_plan text not null check (rate_plan in ('non_refundable', 'flexible')),
  subtotal_ron numeric(10, 2) not null,
  fx_rate numeric(10, 4) not null,
  total_eur numeric(10, 2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  invoice_company text,
  invoice_vat text,
  invoice_reg_com text,
  invoice_address text,
  member_discount_applied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_user_idx on public.bookings (user_id);
create index bookings_property_idx on public.bookings (property_id);
create index bookings_status_idx on public.bookings (status);
create index bookings_order_idx on public.bookings (order_id);

-- ── booking_services (line items per booking) ──────────────────────
create table public.booking_services (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  service_id text not null references public.services (id),
  qty integer not null default 1,
  unit_price_eur numeric(10, 2) not null,
  primary key (booking_id, service_id)
);

-- ── reviews (synced from Hostaway or curated manually) ─────────────
create table public.reviews (
  id text primary key,
  property_id text not null references public.properties (id) on delete cascade,
  source text not null default 'hostaway' check (source in ('hostaway', 'manual')),
  author text,
  rating numeric(3, 1) not null,
  text text,
  stayed_at date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index reviews_property_idx on public.reviews (property_id);

-- ── Row Level Security ──────────────────────────────────────────────
-- Public catalog data: read-only for everyone. User data: owner-only.
-- All writes happen server-side with the service-role key (bypasses RLS).

alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.properties enable row level security;
alter table public.availability enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_services enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "buildings_public_read" on public.buildings
  for select using (true);
create policy "properties_public_read_active" on public.properties
  for select using (active);
create policy "availability_public_read" on public.availability
  for select using (true);
create policy "exchange_rates_public_read" on public.exchange_rates
  for select using (true);
create policy "services_public_read_active" on public.services
  for select using (active);
create policy "reviews_public_read_published" on public.reviews
  for select using (published);

create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);
create policy "booking_services_select_own" on public.booking_services
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.user_id = auth.uid()
    )
  );

-- ── Triggers ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
