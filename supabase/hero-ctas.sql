-- Hero CTAs

create extension if not exists "pgcrypto";

create table if not exists public.hero_ctas (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  icon text not null,
  variant text not null default 'ghost',
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_ctas_position_idx
  on public.hero_ctas (position, created_at desc);

alter table public.hero_ctas enable row level security;

create policy "Public hero ctas" on public.hero_ctas
  for select
  using (published = true);

-- Seed data
insert into public.hero_ctas (label, href, icon, variant, position, published)
values
  ('Enviar petición', '/peticion', 'heart', 'primary', 1, true),
  ('Visítanos', '#visitanos', 'map', 'ghost', 2, true),
  ('Ver avisos', '/avisos', 'calendar', 'ghost', 3, true)
on conflict do nothing;