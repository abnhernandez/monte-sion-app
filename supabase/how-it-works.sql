-- How it works steps

create extension if not exists "pgcrypto";

create table if not exists public.how_it_works_steps (
  id uuid primary key default gen_random_uuid(),
  step integer not null,
  title text not null,
  description text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists how_it_works_steps_step_idx
  on public.how_it_works_steps (step);

alter table public.how_it_works_steps enable row level security;

create policy "Public how it works" on public.how_it_works_steps
  for select
  using (published = true);

-- Seed data
insert into public.how_it_works_steps (step, title, description, published)
values
  (
    1,
    'Visítanos',
    'Conoce la iglesia y participa en una reunión. No necesitas registro previo.',
    true
  ),
  (
    2,
    'Conéctate',
    'Únete a un ministerio o grupo de WhatsApp que se adapte a ti.',
    true
  ),
  (
    3,
    'Crece',
    'Accede a lecciones, recursos y acompañamiento para tu vida espiritual.',
    true
  )
on conflict (step) do nothing;