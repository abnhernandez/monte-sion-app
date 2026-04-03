create extension if not exists pgcrypto;

create table if not exists public.camp_registrations (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null unique,
  qr_payload text not null,
  status text not null default 'registered' check (status in ('registered', 'checked_in')),
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  age integer not null check (age between 5 and 99),
  is_minor boolean not null default false,
  curp text not null,
  gender text not null check (gender in ('H', 'M')),
  attendance_confirmation text not null default 'yes' check (attendance_confirmation in ('yes', 'no', 'maybe')),
  needs_transport boolean not null default false,
  interested_in_baptism boolean not null default false,
  church_name text not null,
  city text not null,
  camp_role text not null check (camp_role in ('participant', 'leader', 'server', 'guest')),
  has_allergies boolean not null default false,
  allergies_details text not null default '',
  email text not null,
  phone text not null,
  emergency_name text not null,
  emergency_phone text not null,
  emergency_relationship text not null,
  emergency_address text not null,
  guardian_name text not null default '',
  guardian_relationship text not null default '',
  guardian_curp text not null default '',
  guardian_phone text not null default '',
  guardian_email text not null default '',
  guardian_signature_data_url text not null default '',
  guardian_id_path text,
  terms_accepted boolean not null default false
);

create index if not exists camp_registrations_ticket_id_idx
  on public.camp_registrations (ticket_id);

create index if not exists camp_registrations_email_idx
  on public.camp_registrations (email);

create index if not exists camp_registrations_created_at_idx
  on public.camp_registrations (created_at desc);

create index if not exists camp_registrations_checked_in_at_idx
  on public.camp_registrations (checked_in_at desc);

alter table public.camp_registrations enable row level security;

alter table public.camp_registrations
  add column if not exists attendance_confirmation text not null default 'yes';

alter table public.camp_registrations
  add column if not exists needs_transport boolean not null default false;

alter table public.camp_registrations
  add column if not exists interested_in_baptism boolean not null default false;

alter table public.camp_registrations
  drop constraint if exists camp_registrations_attendance_confirmation_check;

alter table public.camp_registrations
  add constraint camp_registrations_attendance_confirmation_check
  check (attendance_confirmation in ('yes', 'no', 'maybe'));

insert into storage.buckets (id, name, public)
values ('camp-documents', 'camp-documents', false)
on conflict (id) do nothing;
