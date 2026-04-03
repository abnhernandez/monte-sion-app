-- CTA section

create extension if not exists "pgcrypto";

create table if not exists public.cta_settings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null,
  primary_label text not null,
  primary_href text not null,
  secondary_label text not null,
  secondary_href text not null,
  secondary_external boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cta_settings enable row level security;

create policy "Public cta settings" on public.cta_settings
  for select
  using (published = true);

-- Seed data
insert into public.cta_settings (
  title,
  description,
  icon,
  primary_label,
  primary_href,
  secondary_label,
  secondary_href,
  secondary_external,
  published
)
values
  (
    '¿Necesitas oración?',
    'Envía tu petición y nuestro equipo orará por ti. Tu solicitud es confidencial.',
    'heart',
    'Enviar petición',
    '/peticion',
    'Contactar por WhatsApp',
    'https://wa.me/529512091644?text=Hola.%20Necesito%20de%20Dios.',
    true,
    true
  )
on conflict do nothing;