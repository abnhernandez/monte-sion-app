-- Testimonials table + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_published_idx
  on public.testimonials (published);

create index if not exists testimonials_position_idx
  on public.testimonials (position, created_at desc);

alter table public.testimonials enable row level security;

-- Public read access only for published testimonials
create policy "Public testimonials" on public.testimonials
  for select
  using (published = true);
