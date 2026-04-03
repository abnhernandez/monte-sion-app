-- FAQ table + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists faqs_published_idx
  on public.faqs (published);

create index if not exists faqs_position_idx
  on public.faqs (position, created_at desc);

alter table public.faqs enable row level security;

create policy "Public faqs" on public.faqs
  for select
  using (published = true);
