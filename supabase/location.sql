-- Location table + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Visítanos',
  address_line1 text not null,
  address_line2 text not null,
  city text not null,
  map_label text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists locations_published_idx
  on public.locations (published);

create index if not exists locations_position_idx
  on public.locations (position, created_at desc);

alter table public.locations enable row level security;

create policy "Public locations" on public.locations
  for select
  using (published = true);

-- Seed data
insert into public.locations
  (title, address_line1, address_line2, city, map_label, position, published)
values
  (
    'Visítanos',
    'Cuicatlán 184, Col. Niños Héroes',
    'Santa María Atzompa, Oaxaca',
    'Oaxaca de Juárez, México',
    'Santa María Atzompa',
    1,
    true
  );
