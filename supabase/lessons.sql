-- Lessons tables + public read policy
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  href text not null,
  featured boolean not null default true,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  views integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);


create index if not exists lessons_featured_idx
  on public.lessons (featured, published);

create index if not exists lessons_position_idx
  on public.lessons (position, published_at desc);

alter table public.lessons enable row level security;

create policy "Public lessons" on public.lessons
  for select
  using (published = true);

-- Seed lessons
insert into public.lessons
  (title, href, featured, published, published_at, views, position)
values
  (
    '¿Quién es Dios?',
    '/lecciones/clase/789207',
    true,
    true,
    now() - interval '40 days',
    1280,
    1
  ),
  (
    '¿Cómo buscar a Dios?',
    '/lecciones/clase/790207',
    true,
    true,
    now() - interval '32 days',
    1045,
    2
  ),
  (
    'Unción del Espíritu Santo',
    '/lecciones/clase/791207',
    true,
    true,
    now() - interval '26 days',
    980,
    3
  ),
  (
    '¿Cómo honrar a Dios?',
    '/lecciones/clase/792207',
    true,
    true,
    now() - interval '21 days',
    905,
    4
  ),
  (
    'Id y haced discípulos',
    '/lecciones/clase/793207',
    true,
    true,
    now() - interval '18 days',
    860,
    5
  ),
  (
    'La oración que transforma',
    '/lecciones/clase/794207',
    true,
    true,
    now() - interval '14 days',
    740,
    6
  ),
  (
    'El fruto del Espíritu',
    '/lecciones/clase/795207',
    true,
    true,
    now() - interval '10 days',
    690,
    7
  ),
  (
    'Fe en tiempos difíciles',
    '/lecciones/clase/796207',
    true,
    true,
    now() - interval '6 days',
    610,
    8
  );

-- Seed reactions
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 120 from public.lessons where title = '¿Quién es Dios?';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'love', 86 from public.lessons where title = '¿Quién es Dios?';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'amen', 64 from public.lessons where title = '¿Quién es Dios?';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 98 from public.lessons where title = '¿Cómo buscar a Dios?';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'love', 75 from public.lessons where title = '¿Cómo buscar a Dios?';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'pray', 42 from public.lessons where title = '¿Cómo buscar a Dios?';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 88 from public.lessons where title = 'Unción del Espíritu Santo';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'love', 70 from public.lessons where title = 'Unción del Espíritu Santo';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'wow', 33 from public.lessons where title = 'Unción del Espíritu Santo';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 92 from public.lessons where title = '¿Cómo honrar a Dios?';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'amen', 55 from public.lessons where title = '¿Cómo honrar a Dios?';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 84 from public.lessons where title = 'Id y haced discípulos';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'love', 61 from public.lessons where title = 'Id y haced discípulos';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 78 from public.lessons where title = 'La oración que transforma';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'pray', 58 from public.lessons where title = 'La oración que transforma';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 73 from public.lessons where title = 'El fruto del Espíritu';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'love', 50 from public.lessons where title = 'El fruto del Espíritu';

insert into public.lesson_reactions (lesson_id, type, count)
select id, 'like', 69 from public.lessons where title = 'Fe en tiempos difíciles';
insert into public.lesson_reactions (lesson_id, type, count)
select id, 'amen', 44 from public.lessons where title = 'Fe en tiempos difíciles';


grant execute on function public.react_to_lesson(uuid, text) to authenticated;