create extension if not exists pgcrypto;

create type public.exercise_visibility as enum ('global', 'private', 'shared');
create type public.exercise_mode as enum ('solo', 'group', 'both');
create type public.exercise_metrics_type as enum ('rating', 'numeric', 'both');
create type public.training_result_type as enum ('rating', 'numeric');
create type public.training_rating as enum ('ok', 'good', 'mastered');

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  how_to text,
  mode public.exercise_mode not null default 'solo',
  metrics_type public.exercise_metrics_type not null default 'rating',
  numeric_unit text,
  category text,
  visibility public.exercise_visibility not null default 'global',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  date date not null default (now() at time zone 'utc')::date,
  result_type public.training_result_type not null,
  rating public.training_rating,
  numeric_value numeric,
  notes text,
  created_at timestamptz not null default now(),
  constraint training_logs_rating_or_numeric_check check (
    (result_type = 'rating' and rating is not null and numeric_value is null)
    or
    (result_type = 'numeric' and numeric_value is not null and rating is null)
  )
);

alter table public.exercises enable row level security;
alter table public.training_logs enable row level security;

create policy "exercises_select_visible"
  on public.exercises
  for select
  to authenticated
  using (
    visibility in ('global', 'shared')
    or (visibility = 'private' and created_by = auth.uid())
  );

create policy "exercises_insert_own_private_or_shared"
  on public.exercises
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and visibility in ('private', 'shared')
  );

create policy "exercises_update_own_private_or_shared"
  on public.exercises
  for update
  to authenticated
  using (created_by = auth.uid() and visibility in ('private', 'shared'))
  with check (created_by = auth.uid() and visibility in ('private', 'shared'));

create policy "exercises_delete_own_private_or_shared"
  on public.exercises
  for delete
  to authenticated
  using (created_by = auth.uid() and visibility in ('private', 'shared'));

create policy "training_logs_select_own"
  on public.training_logs
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "training_logs_insert_own"
  on public.training_logs
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "training_logs_update_own"
  on public.training_logs
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "training_logs_delete_own"
  on public.training_logs
  for delete
  to authenticated
  using (user_id = auth.uid());
