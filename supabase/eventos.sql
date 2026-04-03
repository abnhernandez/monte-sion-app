-- Eventos table + RLS policies
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  fecha_evento timestamptz,
  title text not null,
  subject text not null default '',
  teacher text not null default '',
  description text not null default '',
  start_time time not null,
  end_time time not null,
  start_at timestamptz,
  end_at timestamptz,
  live_link text,
  reading_link text,
  lectura_link text,
  reading_url text,
  enlace_lectura text,
  url_lectura text,
  link_lectura text,
  avatar_url text,
  cover_image_url text,
  kind text not null default 'event',
  audience_roles text[] not null default '{}',
  audience_groups text[] not null default '{}',
  feed_pin boolean not null default false,
  tags text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eventos_time_range_chk check (end_time > start_time),
  constraint eventos_kind_chk check (kind in ('event', 'class'))
);

alter table public.eventos add column if not exists fecha_evento timestamptz;
alter table public.eventos add column if not exists description text not null default '';
alter table public.eventos add column if not exists start_at timestamptz;
alter table public.eventos add column if not exists end_at timestamptz;
alter table public.eventos add column if not exists live_link text;
alter table public.eventos add column if not exists reading_link text;
alter table public.eventos add column if not exists lectura_link text;
alter table public.eventos add column if not exists reading_url text;
alter table public.eventos add column if not exists enlace_lectura text;
alter table public.eventos add column if not exists url_lectura text;
alter table public.eventos add column if not exists link_lectura text;
alter table public.eventos add column if not exists avatar_url text;
alter table public.eventos add column if not exists cover_image_url text;
alter table public.eventos add column if not exists kind text not null default 'event';
alter table public.eventos add column if not exists audience_roles text[] not null default '{}';
alter table public.eventos add column if not exists audience_groups text[] not null default '{}';
alter table public.eventos add column if not exists feed_pin boolean not null default false;

do $$
begin
  alter table public.eventos drop constraint if exists eventos_kind_chk;
  alter table public.eventos add constraint eventos_kind_chk check (kind in ('event', 'class'));
exception when duplicate_object then null;
end $$;

create index if not exists eventos_fecha_idx
  on public.eventos (fecha asc);

create index if not exists eventos_published_fecha_idx
  on public.eventos (published, fecha asc);

create index if not exists eventos_kind_idx
  on public.eventos (kind, published, fecha_evento asc);

create index if not exists eventos_audience_roles_idx
  on public.eventos using gin (audience_roles);

create index if not exists eventos_audience_groups_idx
  on public.eventos using gin (audience_groups);

create or replace function public.set_eventos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_eventos_updated_at on public.eventos;
create trigger trg_eventos_updated_at
before update on public.eventos
for each row execute function public.set_eventos_updated_at();

alter table public.eventos enable row level security;

drop policy if exists "Public eventos read" on public.eventos;
create policy "Public eventos read" on public.eventos
  for select
  using (published = true);

drop policy if exists "Admin leader insert eventos" on public.eventos;
create policy "Admin leader insert eventos" on public.eventos
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader')
    )
  );

drop policy if exists "Admin leader update eventos" on public.eventos;
create policy "Admin leader update eventos" on public.eventos
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader')
    )
  );

drop policy if exists "Admin leader delete eventos" on public.eventos;
create policy "Admin leader delete eventos" on public.eventos
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader')
    )
  );

grant select on table public.eventos to anon, authenticated;
grant insert, update, delete on table public.eventos to authenticated;

-- Main query used by app SSR:
-- select * from public.eventos where published = true order by fecha asc;