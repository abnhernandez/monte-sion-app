-- Stats section

create extension if not exists "pgcrypto";

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  description text not null,
  icon text not null,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists stats_position_idx
  on public.stats (position, created_at desc);

alter table public.stats enable row level security;

create policy "Public stats" on public.stats
  for select
  using (published = true);

-- Seed data
insert into public.stats (label, value, description, icon, position, published)
values
  ('Comunidad', '+10 años', 'de servicio continuo', 'users', 1, true),
  ('Ubicación', 'Atzompa', 'Santa María, Oaxaca', 'map', 2, true),
  ('Enfoque', 'Discipulado', 'formación integral', 'sparkles', 3, true)
on conflict do nothing;