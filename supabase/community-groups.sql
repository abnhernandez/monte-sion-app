-- Community WhatsApp groups table + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.community_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  href text not null,
  highlight boolean not null default false,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists community_groups_published_idx
  on public.community_groups (published);

create index if not exists community_groups_position_idx
  on public.community_groups (position, created_at desc);

alter table public.community_groups enable row level security;

create policy "Public community groups" on public.community_groups
  for select
  using (published = true);

-- Seed data
insert into public.community_groups
  (name, description, href, highlight, position, published)
values
  (
    'Comunidad general',
    'Canal principal para enterarte de todo',
    'https://chat.whatsapp.com/GC6PocIbE3L9a0YhvzWmWk',
  ),
  (
    'Escogidos',
    'Grupo abierto para nuevos; sin permiso de administradores',
    'https://chat.whatsapp.com/IDYHs0Q8EWs6Rk7aIwa6nf',
  ),
  (
    'Llamada a la oración',
    'Estudio bíblico y oración comunitaria',
    'https://chat.whatsapp.com/Lm9bm3fK9PNGHcHNWkavMr',
  ),
  (
    'Jóvenes Monte Sion',
    'Grupo general para jóvenes en la fe',
    'https://chat.whatsapp.com/DkPavPYXDmJK08qjNc48IJ',
  );
