-- Coach role + practice sessions + game roster/lineup

-- Treat coach as staff (same permission level as owner/admin)
create or replace function public.is_group_admin(p_group_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
      and gm.role in ('owner','admin','coach')
  );
$$;

-- Practice sessions (coach-created plans shared to group)
create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date date not null default (now() at time zone 'utc')::date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_session_drills (
  practice_session_id uuid not null references public.practice_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sort_order int not null default 0,
  duration_minutes int,
  notes text,
  primary key (practice_session_id, exercise_id)
);

alter table public.practice_sessions enable row level security;
alter table public.practice_session_drills enable row level security;

create policy "practice_sessions_select_group_member"
  on public.practice_sessions
  for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "practice_sessions_insert_group_staff"
  on public.practice_sessions
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.is_group_admin(group_id)
  );

create policy "practice_sessions_update_group_staff"
  on public.practice_sessions
  for update
  to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "practice_sessions_delete_group_staff"
  on public.practice_sessions
  for delete
  to authenticated
  using (public.is_group_admin(group_id));

create policy "practice_session_drills_select_group_member"
  on public.practice_session_drills
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.practice_sessions ps
      where ps.id = practice_session_drills.practice_session_id
        and public.is_group_member(ps.group_id)
    )
  );

create policy "practice_session_drills_insert_group_staff"
  on public.practice_session_drills
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.practice_sessions ps
      where ps.id = practice_session_drills.practice_session_id
        and public.is_group_admin(ps.group_id)
    )
  );

create policy "practice_session_drills_update_group_staff"
  on public.practice_session_drills
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.practice_sessions ps
      where ps.id = practice_session_drills.practice_session_id
        and public.is_group_admin(ps.group_id)
    )
  )
  with check (
    exists (
      select 1
      from public.practice_sessions ps
      where ps.id = practice_session_drills.practice_session_id
        and public.is_group_admin(ps.group_id)
    )
  );

create policy "practice_session_drills_delete_group_staff"
  on public.practice_session_drills
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.practice_sessions ps
      where ps.id = practice_session_drills.practice_session_id
        and public.is_group_admin(ps.group_id)
    )
  );

-- 4) Games + roster (lineup positions, supports both members and guest names)
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  date date not null default (now() at time zone 'utc')::date,
  opponent text,
  location text,
  formation text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.game_roster_entries (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  position_code text not null,
  -- normalized pitch coordinates (0..100). We'll render these on a pitch later.
  x numeric,
  y numeric,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text,
  shirt_number int,
  created_at timestamptz not null default now(),
  constraint roster_one_identity check (
    (user_id is not null and guest_name is null)
    or
    (user_id is null and guest_name is not null)
  )
);

alter table public.games enable row level security;
alter table public.game_roster_entries enable row level security;

create policy "games_select_group_member"
  on public.games
  for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "games_insert_group_staff"
  on public.games
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.is_group_admin(group_id)
  );

create policy "games_update_group_staff"
  on public.games
  for update
  to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "games_delete_group_staff"
  on public.games
  for delete
  to authenticated
  using (public.is_group_admin(group_id));

create policy "game_roster_entries_select_group_member"
  on public.game_roster_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.games g
      where g.id = game_roster_entries.game_id
        and public.is_group_member(g.group_id)
    )
  );

create policy "game_roster_entries_insert_group_staff"
  on public.game_roster_entries
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.games g
      where g.id = game_roster_entries.game_id
        and public.is_group_admin(g.group_id)
    )
  );

create policy "game_roster_entries_update_group_staff"
  on public.game_roster_entries
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.games g
      where g.id = game_roster_entries.game_id
        and public.is_group_admin(g.group_id)
    )
  )
  with check (
    exists (
      select 1
      from public.games g
      where g.id = game_roster_entries.game_id
        and public.is_group_admin(g.group_id)
    )
  );

create policy "game_roster_entries_delete_group_staff"
  on public.game_roster_entries
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.games g
      where g.id = game_roster_entries.game_id
        and public.is_group_admin(g.group_id)
    )
  );
