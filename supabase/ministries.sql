-- Ministries table + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null default 'users',
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ministries_published_idx
  on public.ministries (published);

create index if not exists ministries_position_idx
  on public.ministries (position, created_at desc);

alter table public.ministries enable row level security;

create policy "Public ministries" on public.ministries
  for select
  using (published = true);

-- Seed data
insert into public.ministries
  (title, description, icon, position, published)
values
  (
    'Jóvenes',
    'Encuentros, discipulado y comunidad para la nueva generación',
    'users',
    1,
    true
  ),
  (
    'Mujeres',
    'Formación, acompañamiento espiritual y comunidad femenina',
    'heart',
    2,
    true
  ),
  (
    'Niños',
    'Enseñanza bíblica creativa para los más pequeños',
    'baby',
    3,
    true
  );