create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles'
  ) then
    update public.profiles
    set role = 'user'
    where role is null;

    alter table public.profiles
      drop constraint if exists profiles_role_check;

    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('admin', 'leader', 'staff', 'user'));
  end if;
exception
  when undefined_table then null;
end $$;

create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_birthday_profile_name_updates()
returns trigger
language plpgsql
as $$
begin
  if new.name is distinct from old.name then
    update public.birthday_comments
    set author_name = new.name
    where author_profile_id = new.id;

    update public.gift_reservations
    set reserved_by = new.name
    where reserved_by_profile_id = new.id;
  end if;

  return new;
end;
$$;

create table if not exists public.birthdays (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  birth_date date not null,
  ministry_name text not null default '',
  leader_id uuid references public.profiles(id) on delete set null,
  notes text not null default '',
  general_note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.birthdays
  add column if not exists notes text not null default '';

create unique index if not exists birthdays_profile_id_uidx
  on public.birthdays (profile_id)
  where profile_id is not null;

create index if not exists birthdays_birth_date_idx
  on public.birthdays (birth_date asc);

create index if not exists birthdays_leader_idx
  on public.birthdays (leader_id);

drop trigger if exists trg_birthdays_updated_at on public.birthdays;
create trigger trg_birthdays_updated_at
before update on public.birthdays
for each row execute function public.set_timestamp_updated_at();

create table if not exists public.birthday_occurrences (
  id uuid primary key default gen_random_uuid(),
  birthday_id uuid not null references public.birthdays(id) on delete cascade,
  celebration_year integer not null,
  birthday_date_for_year date not null,
  turning_age integer not null,
  scripture_reference text not null default '',
  scripture_text text not null default '',
  prayer_focus text not null default '',
  celebration_note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'prayed', 'ready', 'celebrated')),
  prayed_at timestamptz,
  celebrated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint birthday_occurrences_year_uidx unique (birthday_id, celebration_year)
);

create index if not exists birthday_occurrences_date_idx
  on public.birthday_occurrences (birthday_date_for_year asc);

drop trigger if exists trg_birthday_occurrences_updated_at on public.birthday_occurrences;
create trigger trg_birthday_occurrences_updated_at
before update on public.birthday_occurrences
for each row execute function public.set_timestamp_updated_at();

create table if not exists public.birthday_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.birthday_occurrences(id) on delete cascade,
  reminder_key text not null,
  channel text not null check (channel in ('notification', 'email')),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  sent_at timestamptz not null default now(),
  constraint birthday_reminder_logs_unique unique (occurrence_id, reminder_key, channel, recipient_profile_id)
);

alter table public.gifts
  add column if not exists birthday_occurrence_id uuid references public.birthday_occurrences(id) on delete cascade;

alter table public.gifts
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

alter table public.gift_reservations
  add column if not exists reserved_by_profile_id uuid references public.profiles(id) on delete set null;

alter table public.gift_reservations
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.birthday_comments (
  id uuid primary key default gen_random_uuid(),
  birthday_id uuid not null references public.birthdays(id) on delete cascade,
  parent_comment_id uuid references public.birthday_comments(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('admin', 'leader', 'staff', 'user')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.birthday_comments
  add column if not exists parent_comment_id uuid references public.birthday_comments(id) on delete cascade;

create index if not exists birthday_comments_birthday_id_idx
  on public.birthday_comments (birthday_id, created_at asc);

create index if not exists birthday_comments_parent_comment_idx
  on public.birthday_comments (parent_comment_id, created_at asc);

drop trigger if exists trg_birthday_comments_updated_at on public.birthday_comments;
create trigger trg_birthday_comments_updated_at
before update on public.birthday_comments
for each row execute function public.set_timestamp_updated_at();

drop trigger if exists trg_profiles_sync_birthday_activity_names on public.profiles;
create trigger trg_profiles_sync_birthday_activity_names
after update of name on public.profiles
for each row
when (new.name is distinct from old.name)
execute function public.sync_birthday_profile_name_updates();

create index if not exists gifts_birthday_occurrence_idx
  on public.gifts (birthday_occurrence_id);

create index if not exists gift_reservations_gift_id_idx
  on public.gift_reservations (gift_id);

create index if not exists gift_reservations_profile_id_idx
  on public.gift_reservations (reserved_by_profile_id);

insert into public.birthday_occurrences (
  birthday_id,
  celebration_year,
  birthday_date_for_year,
  turning_age
)
select
  b.id,
  extract(year from current_date)::integer,
  make_date(
    extract(year from current_date)::integer,
    extract(month from b.birth_date)::integer,
    case
      when extract(month from b.birth_date) = 2
        and extract(day from b.birth_date) = 29
        and not (
          mod(extract(year from current_date)::integer, 4) = 0
          and (
            mod(extract(year from current_date)::integer, 100) <> 0
            or mod(extract(year from current_date)::integer, 400) = 0
          )
        )
        then 28
      else extract(day from b.birth_date)::integer
    end
  ),
  extract(year from current_date)::integer - extract(year from b.birth_date)::integer
from public.birthdays b
on conflict (birthday_id, celebration_year) do update
set
  birthday_date_for_year = excluded.birthday_date_for_year,
  turning_age = excluded.turning_age;

update public.gifts g
set birthday_occurrence_id = o.id
from public.birthdays b
join public.birthday_occurrences o
  on o.birthday_id = b.id
 and o.celebration_year = extract(year from current_date)::integer
where g.birthday_occurrence_id is null
  and g.birthday_id = b.id;

alter table public.birthdays enable row level security;
alter table public.birthday_occurrences enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.birthday_reminder_logs enable row level security;
alter table public.birthday_comments enable row level security;

drop policy if exists "Birthday team read birthdays" on public.birthdays;
create policy "Birthday team read birthdays" on public.birthdays
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday admins manage birthdays" on public.birthdays;
create policy "Birthday admins manage birthdays" on public.birthdays
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Birthday team read occurrences" on public.birthday_occurrences;
create policy "Birthday team read occurrences" on public.birthday_occurrences
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team update occurrences" on public.birthday_occurrences;
create policy "Birthday team update occurrences" on public.birthday_occurrences
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

drop policy if exists "Birthday admin insert occurrences" on public.birthday_occurrences;
create policy "Birthday admin insert occurrences" on public.birthday_occurrences
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Birthday team read gifts" on public.gifts;
create policy "Birthday team read gifts" on public.gifts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team manage gifts" on public.gifts;
create policy "Birthday team manage gifts" on public.gifts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = created_by
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = created_by
        )
    )
  );

drop policy if exists "Birthday team insert gifts" on public.gifts;
create policy "Birthday team insert gifts" on public.gifts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team delete gifts" on public.gifts;
create policy "Birthday team delete gifts" on public.gifts
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = created_by
        )
    )
  );

drop policy if exists "Birthday team read reservations" on public.gift_reservations;
create policy "Birthday team read reservations" on public.gift_reservations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team manage reservations" on public.gift_reservations;
create policy "Birthday team manage reservations" on public.gift_reservations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday admins manage reminder logs" on public.birthday_reminder_logs;
create policy "Birthday admins manage reminder logs" on public.birthday_reminder_logs
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Birthday team read comments" on public.birthday_comments;
create policy "Birthday team read comments" on public.birthday_comments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team insert comments" on public.birthday_comments;
create policy "Birthday team insert comments" on public.birthday_comments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'leader', 'staff')
    )
  );

drop policy if exists "Birthday team update comments" on public.birthday_comments;
create policy "Birthday team update comments" on public.birthday_comments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = author_profile_id
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = author_profile_id
        )
    )
  );

drop policy if exists "Birthday team delete comments" on public.birthday_comments;
create policy "Birthday team delete comments" on public.birthday_comments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'leader')
          or p.id = author_profile_id
        )
    )
  );

grant select on public.birthdays to authenticated;
grant select, update on public.birthday_occurrences to authenticated;
grant select, insert, update, delete on public.gifts to authenticated;
grant select, insert, update, delete on public.gift_reservations to authenticated;
grant select, insert on public.birthday_reminder_logs to authenticated;
grant select, insert, update, delete on public.birthday_comments to authenticated;
