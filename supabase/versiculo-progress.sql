create table if not exists public.versiculo_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_verse_id bigint,
  difficulty integer not null default 2 check (difficulty between 1 and 4),
  practice_mode boolean not null default false,
  exam_mode boolean not null default false,
  exam_duration_seconds integer not null default 120 check (exam_duration_seconds in (60, 120, 180)),
  best_exam_score integer check (best_exam_score between 0 and 100),
  last_score integer check (last_score between 0 and 100),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.versiculo_progress enable row level security;

create policy if not exists "versiculo_progress_select_own"
on public.versiculo_progress
for select
using (auth.uid() = user_id);

create policy if not exists "versiculo_progress_insert_own"
on public.versiculo_progress
for insert
with check (auth.uid() = user_id);

create policy if not exists "versiculo_progress_update_own"
on public.versiculo_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
