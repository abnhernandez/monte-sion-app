-- Features section

create extension if not exists "pgcrypto";

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  href text not null,
  icon text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists features_position_idx
  on public.features (position, created_at desc);

alter table public.features enable row level security;

create policy "Public features" on public.features
  for select
  using (published = true);

-- Seed data
insert into public.features (title, description, href, icon, position, published)
values
  ('Biblia', 'Lee y medita en la Palabra de Dios', '/bible', 'book', 1, true),
  ('Cómo orar', 'Guía práctica para fortalecer tu oración', '/orar', 'message', 2, true),
  ('Eventos', 'Agenda semanal y próximos encuentros', '/eventos', 'calendar', 3, true),
  ('Avisos', 'Información y comunicados importantes', '/avisos', 'bell', 4, true)
on conflict do nothing;