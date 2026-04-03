-- Quick actions

create extension if not exists "pgcrypto";

create table if not exists public.quick_actions (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists quick_actions_position_idx
  on public.quick_actions (position, created_at desc);

alter table public.quick_actions enable row level security;

create policy "Public quick actions" on public.quick_actions
  for select
  using (published = true);

-- Seed data
insert into public.quick_actions (label, href, position, published)
values
  ('Enviar petición', '/peticion', 1, true),
  ('Leer Biblia', '/bible', 2, true),
  ('Aprender a orar', '/orar', 3, true),
  ('Ver eventos', '/eventos', 4, true),
  ('Recursos', '/estudio', 5, true),
  ('Avisos', '/avisos', 6, true)
on conflict do nothing;