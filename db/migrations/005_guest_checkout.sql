-- 005 — Guest checkout (client decision 04.09, Spec M1.4/M3).
-- A booking may now exist WITHOUT a member account: user_id becomes nullable.
-- Guest identity lives in the existing guest_name / guest_email / guest_phone
-- columns (already NOT NULL where it matters). Guest bookings are always
-- rate_plan 'non_refundable' (DX7) — enforced in app code AND by the CHECK
-- below, so no code path can ever hand a guest a refundable booking.
--
-- RLS needs NO change: `bookings_select_own` uses `auth.uid() = user_id`,
-- and NULL never equals any uid — guest rows are invisible to every client
-- session by construction (server-side service role only). Same for
-- booking_services_select_own.
--
-- Run manually in Supabase SQL editor, then: npm run db:types

alter table public.bookings alter column user_id drop not null;

alter table public.bookings
  add constraint bookings_guest_non_refundable
  check (user_id is not null or rate_plan = 'non_refundable');
