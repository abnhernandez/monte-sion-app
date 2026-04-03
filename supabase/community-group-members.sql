-- Community group membership table for explicit audience targeting.

create extension if not exists "pgcrypto";

create table if not exists public.community_group_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  community_group_id uuid not null references public.community_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, community_group_id)
);

create index if not exists community_group_members_profile_idx
  on public.community_group_members (profile_id);

create index if not exists community_group_members_group_idx
  on public.community_group_members (community_group_id);

alter table public.community_group_members enable row level security;

drop policy if exists "Community group members own read" on public.community_group_members;
create policy "Community group members own read" on public.community_group_members
  for select
  to authenticated
  using (profile_id = auth.uid());

drop policy if exists "Community group members admin read" on public.community_group_members;
create policy "Community group members admin read" on public.community_group_members
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Community group members admin write" on public.community_group_members;
create policy "Community group members admin write" on public.community_group_members
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
