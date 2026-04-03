-- Hero section

create extension if not exists "pgcrypto";

create table if not exists public.hero_settings (
  id uuid primary key default gen_random_uuid(),
  badge_label text not null,
  badge_href text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hero_schedule (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  time text not null,
  location text not null,
  href text,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_schedule_position_idx
  on public.hero_schedule (position, created_at desc);

alter table public.hero_settings enable row level security;
alter table public.hero_schedule enable row level security;

create policy "Public hero settings" on public.hero_settings
  for select
  using (published = true);

create policy "Public hero schedule" on public.hero_schedule
  for select
  using (published = true);

-- Seed data
insert into public.hero_settings (badge_label, badge_href, published)
values
  ('Iglesia Cristiana Monte Sion Oaxaca', '/visitanos', true)
on conflict do nothing;

insert into public.hero_schedule (label, time, location, href, position, published)
values
  ('Reunión general', 'Domingos 2:30 p.m.', 'Monte Sion · Santa María Atzompa', null, 1, true),
  ('Reunión de oración', 'Viernes 6:00 p.m.', 'Abierta a toda la iglesia', null, 2, true),
  ('Predicaciones', 'Ver recursos', '/estudio', '/estudio', 3, true)
on conflict do nothing;