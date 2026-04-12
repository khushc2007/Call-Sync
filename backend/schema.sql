-- CallSync AI — Supabase schema v2
-- Run this in your Supabase SQL editor

create table if not exists appointments (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  phone             text not null,
  date              date not null,
  time              text not null,
  calendar_event_id text,
  reminded          boolean default false,
  status            text not null default 'confirmed' check (status in ('confirmed', 'pending', 'cancelled')),
  condition         text,
  doctor            text,
  created_at        timestamptz default now()
);

-- Index for phone-based lookups (replaces name-based)
create index if not exists idx_appointments_phone on appointments (phone);
create index if not exists idx_appointments_date  on appointments (date);
create index if not exists idx_appointments_status on appointments (status);

-- Enable Row Level Security
alter table appointments enable row level security;

-- Policy: Allow service role full access (backend uses service key via env)
create policy "Service role full access"
  on appointments
  for all
  using (true)
  with check (true);

-- Policy: Allow anon read-only for dashboard (uses anon key)
-- Tighten this in production by requiring auth
create policy "Dashboard read"
  on appointments
  for select
  to anon
  using (true);

-- Policy: Allow anon inserts from dashboard (can restrict to authenticated in prod)
create policy "Dashboard insert"
  on appointments
  for insert
  to anon
  with check (true);

create policy "Dashboard update"
  on appointments
  for update
  to anon
  using (true);

-- Enable realtime for live dashboard updates
alter publication supabase_realtime add table appointments;
