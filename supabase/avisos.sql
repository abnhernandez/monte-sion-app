-- AVISOS social hub schema

create extension if not exists "pgcrypto";

create or replace function public.set_avisos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.can_access_aviso(
  audience_roles text[],
  audience_groups text[]
)
returns boolean
language sql
stable
as $$
  select
    (
      coalesce(array_length(audience_roles, 1), 0) = 0
      and coalesce(array_length(audience_groups, 1), 0) = 0
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = any(audience_roles)
    )
    or exists (
      select 1
      from public.community_group_members m
      where m.profile_id = auth.uid()
        and m.community_group_id::text = any(audience_groups)
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    );
$$;

create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  summary text not null default '',
  contenido text not null default '',
  media_blocks jsonb not null default '[]'::jsonb,
  publicado boolean not null default false,
  audience_roles text[] not null default '{}'::text[],
  audience_groups text[] not null default '{}'::text[],
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_profile_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Admin',
  author_role text not null default 'admin',
  post_type text not null default 'aviso',
  cover_image_url text,
  is_pinned boolean not null default false,
  allow_comments boolean not null default true,
  allow_reactions boolean not null default true,
  constraint avisos_author_role_chk check (author_role in ('admin', 'leader', 'staff', 'user')),
  constraint avisos_post_type_chk check (post_type in ('info', 'aviso', 'advertencia', 'notificacion'))
);

alter table public.avisos add column if not exists summary text not null default '';
alter table public.avisos add column if not exists contenido text not null default '';
alter table public.avisos add column if not exists media_blocks jsonb not null default '[]'::jsonb;
alter table public.avisos add column if not exists publicado boolean not null default false;
alter table public.avisos add column if not exists audience_roles text[] not null default '{}'::text[];
alter table public.avisos add column if not exists audience_groups text[] not null default '{}'::text[];
alter table public.avisos add column if not exists published_at timestamptz;
alter table public.avisos add column if not exists updated_at timestamptz not null default now();
alter table public.avisos add column if not exists author_profile_id uuid references public.profiles(id) on delete set null;
alter table public.avisos add column if not exists author_name text not null default 'Admin';
alter table public.avisos add column if not exists author_role text not null default 'admin';
alter table public.avisos add column if not exists post_type text not null default 'aviso';
alter table public.avisos add column if not exists cover_image_url text;
alter table public.avisos add column if not exists is_pinned boolean not null default false;
alter table public.avisos add column if not exists allow_comments boolean not null default true;
alter table public.avisos add column if not exists allow_reactions boolean not null default true;

do $$
begin
  alter table public.avisos drop constraint if exists avisos_author_role_chk;
  alter table public.avisos add constraint avisos_author_role_chk check (author_role in ('admin', 'leader', 'staff', 'user'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.avisos drop constraint if exists avisos_post_type_chk;
  alter table public.avisos add constraint avisos_post_type_chk check (post_type in ('info', 'aviso', 'advertencia', 'notificacion'));
exception when duplicate_object then null;
end $$;

update public.avisos
set
  post_type = coalesce(nullif(post_type, ''), 'aviso'),
  author_name = coalesce(nullif(author_name, ''), 'Admin'),
  author_role = case when author_role in ('admin', 'leader', 'staff', 'user') then author_role else 'admin' end,
  allow_comments = coalesce(allow_comments, true),
  allow_reactions = coalesce(allow_reactions, true),
  summary = coalesce(summary, ''),
  updated_at = coalesce(updated_at, now())
where true;

create table if not exists public.aviso_attachments (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid not null references public.avisos(id) on delete cascade,
  kind text not null,
  source_type text not null default 'storage',
  storage_bucket text,
  storage_path text,
  external_url text,
  thumbnail_path text,
  title text not null default '',
  file_name text not null default '',
  mime_type text not null default '',
  size_bytes bigint,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint aviso_attachments_kind_chk check (kind in ('image', 'video', 'file', 'embed')),
  constraint aviso_attachments_source_chk check (source_type in ('storage', 'external'))
);

create table if not exists public.aviso_reactions (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid not null references public.avisos(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  unique (aviso_id, profile_id),
  constraint aviso_reactions_type_chk check (type in ('like', 'love', 'laugh', 'wow'))
);

create table if not exists public.aviso_comments (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid not null references public.avisos(id) on delete cascade,
  parent_comment_id uuid references public.aviso_comments(id) on delete set null,
  author_profile_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Usuario',
  author_role text not null default 'user',
  content text not null default '',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aviso_comments_author_role_chk check (author_role in ('admin', 'leader', 'staff', 'user'))
);

create table if not exists public.aviso_comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.aviso_comments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, profile_id),
  constraint aviso_comment_reactions_type_chk check (type in ('like', 'love', 'laugh', 'wow'))
);

create table if not exists public.community_group_managers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  community_group_id uuid not null references public.community_groups(id) on delete cascade,
  can_publish boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, community_group_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  tone text not null default 'action',
  role text not null default 'user',
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_role_chk check (role in ('admin', 'leader', 'staff', 'user', 'intercessor'))
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  event text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  silent_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists avisos_publicado_idx
  on public.avisos (is_pinned desc, publicado, published_at desc, created_at desc);
create index if not exists avisos_audience_roles_idx
  on public.avisos using gin (audience_roles);
create index if not exists avisos_audience_groups_idx
  on public.avisos using gin (audience_groups);
create index if not exists aviso_attachments_aviso_idx
  on public.aviso_attachments (aviso_id, position asc);
create index if not exists aviso_reactions_aviso_idx
  on public.aviso_reactions (aviso_id);
create index if not exists aviso_comments_aviso_idx
  on public.aviso_comments (aviso_id, created_at asc);
create index if not exists aviso_comments_parent_idx
  on public.aviso_comments (parent_comment_id, created_at asc);
create index if not exists aviso_comment_reactions_comment_idx
  on public.aviso_comment_reactions (comment_id);
create index if not exists community_group_managers_profile_idx
  on public.community_group_managers (profile_id);
create index if not exists notifications_user_read_idx
  on public.notifications (user_id, read, created_at desc);

drop trigger if exists trg_avisos_updated_at on public.avisos;
create trigger trg_avisos_updated_at
before update on public.avisos
for each row execute function public.set_avisos_updated_at();

drop trigger if exists trg_aviso_comments_updated_at on public.aviso_comments;
create trigger trg_aviso_comments_updated_at
before update on public.aviso_comments
for each row execute function public.set_avisos_updated_at();

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_avisos_updated_at();

drop trigger if exists trg_push_subscriptions_updated_at on public.push_subscriptions;
create trigger trg_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row execute function public.set_avisos_updated_at();

alter table public.avisos enable row level security;
alter table public.aviso_attachments enable row level security;
alter table public.aviso_reactions enable row level security;
alter table public.aviso_comments enable row level security;
alter table public.aviso_comment_reactions enable row level security;
alter table public.community_group_managers enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_events enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Avisos read visible" on public.avisos;
create policy "Avisos read visible" on public.avisos
  for select
  using (
    publicado = true
    and public.can_access_aviso(audience_roles, audience_groups)
  );

drop policy if exists "Avisos authenticated write" on public.avisos;
create policy "Avisos authenticated write" on public.avisos
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Aviso attachments read visible" on public.aviso_attachments;
create policy "Aviso attachments read visible" on public.aviso_attachments
  for select
  using (
    exists (
      select 1
      from public.avisos a
      where a.id = aviso_id
        and a.publicado = true
        and public.can_access_aviso(a.audience_roles, a.audience_groups)
    )
  );

drop policy if exists "Aviso attachments authenticated write" on public.aviso_attachments;
create policy "Aviso attachments authenticated write" on public.aviso_attachments
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Aviso reactions read visible" on public.aviso_reactions;
create policy "Aviso reactions read visible" on public.aviso_reactions
  for select
  using (
    exists (
      select 1
      from public.avisos a
      where a.id = aviso_id
        and a.publicado = true
        and public.can_access_aviso(a.audience_roles, a.audience_groups)
    )
  );

drop policy if exists "Aviso reactions own write" on public.aviso_reactions;
create policy "Aviso reactions own write" on public.aviso_reactions
  for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "Aviso comments read visible" on public.aviso_comments;
create policy "Aviso comments read visible" on public.aviso_comments
  for select
  using (
    exists (
      select 1
      from public.avisos a
      where a.id = aviso_id
        and a.publicado = true
        and public.can_access_aviso(a.audience_roles, a.audience_groups)
    )
  );

drop policy if exists "Aviso comments authenticated write" on public.aviso_comments;
create policy "Aviso comments authenticated write" on public.aviso_comments
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Aviso comment reactions read visible" on public.aviso_comment_reactions;
create policy "Aviso comment reactions read visible" on public.aviso_comment_reactions
  for select
  using (
    exists (
      select 1
      from public.aviso_comments c
      join public.avisos a on a.id = c.aviso_id
      where c.id = comment_id
        and a.publicado = true
        and public.can_access_aviso(a.audience_roles, a.audience_groups)
    )
  );

drop policy if exists "Aviso comment reactions own write" on public.aviso_comment_reactions;
create policy "Aviso comment reactions own write" on public.aviso_comment_reactions
  for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "Community group managers own read" on public.community_group_managers;
create policy "Community group managers own read" on public.community_group_managers
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Community group managers admin write" on public.community_group_managers;
create policy "Community group managers admin write" on public.community_group_managers
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

drop policy if exists "Notifications own read" on public.notifications;
create policy "Notifications own read" on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Notifications own update" on public.notifications;
create policy "Notifications own update" on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Notification events own read" on public.notification_events;
create policy "Notification events own read" on public.notification_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.notifications n
      where n.id = notification_id
        and n.user_id = auth.uid()
    )
  );

drop policy if exists "Push subscriptions own manage" on public.push_subscriptions;
create policy "Push subscriptions own manage" on public.push_subscriptions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "User preferences own manage" on public.user_preferences;
create policy "User preferences own manage" on public.user_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select on public.avisos to anon, authenticated;
grant select on public.aviso_attachments to anon, authenticated;
grant select on public.aviso_reactions to anon, authenticated;
grant select on public.aviso_comments to anon, authenticated;
grant select on public.aviso_comment_reactions to anon, authenticated;
grant select on public.notifications to authenticated;
grant select on public.notification_events to authenticated;
grant select, insert, update, delete on public.aviso_reactions to authenticated;
grant select, insert, update, delete on public.aviso_comment_reactions to authenticated;
grant select, insert, update, delete on public.aviso_comments to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;

insert into storage.buckets (id, name, public)
values ('avisos-media', 'avisos-media', false)
on conflict (id) do nothing;
