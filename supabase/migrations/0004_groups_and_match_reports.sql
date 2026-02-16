alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

create unique index if not exists profiles_email_unique on public.profiles (email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create type public.group_role as enum ('owner', 'admin', 'member');
create type public.match_visibility as enum ('private', 'shared');

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.group_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.match_reports (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default (now() at time zone 'utc')::date,
  opponent text,
  location text,
  score_for int,
  score_against int,
  position_played text,
  notes text not null,
  self_rating int,
  visibility public.match_visibility not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists public.match_report_shared_groups (
  match_report_id uuid not null references public.match_reports(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  primary key (match_report_id, group_id)
);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.match_reports enable row level security;
alter table public.match_report_shared_groups enable row level security;

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
      and gm.role in ('owner','admin')
  );
$$;

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
  );
$$;

create policy "groups_select_member"
  on public.groups
  for select
  to authenticated
  using (public.is_group_member(id));

create policy "groups_insert_authenticated"
  on public.groups
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "groups_update_owner_admin"
  on public.groups
  for update
  to authenticated
  using (public.is_group_admin(id))
  with check (public.is_group_admin(id));

create policy "groups_delete_owner_admin"
  on public.groups
  for delete
  to authenticated
  using (public.is_group_admin(id));

create policy "group_members_select_member"
  on public.group_members
  for select
  to authenticated
  using (public.is_group_member(group_id));

create policy "group_members_insert_owner_admin"
  on public.group_members
  for insert
  to authenticated
  with check (public.is_group_admin(group_id));

create policy "group_members_update_owner_admin"
  on public.group_members
  for update
  to authenticated
  using (public.is_group_admin(group_id))
  with check (public.is_group_admin(group_id));

create policy "group_members_delete_owner_admin"
  on public.group_members
  for delete
  to authenticated
  using (public.is_group_admin(group_id));

create or replace function public.add_group_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_group_created_add_owner on public.groups;
create trigger on_group_created_add_owner
  after insert on public.groups
  for each row execute procedure public.add_group_creator_as_owner();

create policy "match_reports_select_author_or_shared"
  on public.match_reports
  for select
  to authenticated
  using (
    author_user_id = auth.uid()
    or (
      visibility = 'shared'
      and exists (
        select 1
        from public.match_report_shared_groups msg
        join public.group_members gm on gm.group_id = msg.group_id
        where msg.match_report_id = match_reports.id
          and gm.user_id = auth.uid()
      )
    )
  );

create policy "match_reports_insert_author"
  on public.match_reports
  for insert
  to authenticated
  with check (author_user_id = auth.uid());

create policy "match_reports_update_author"
  on public.match_reports
  for update
  to authenticated
  using (author_user_id = auth.uid())
  with check (author_user_id = auth.uid());

create policy "match_reports_delete_author"
  on public.match_reports
  for delete
  to authenticated
  using (author_user_id = auth.uid());

create policy "match_report_shared_groups_select_author_or_group_member"
  on public.match_report_shared_groups
  for select
  to authenticated
  using (
    exists (
      select 1 from public.match_reports mr
      where mr.id = match_report_shared_groups.match_report_id
        and mr.author_user_id = auth.uid()
    )
    or public.is_group_member(group_id)
  );

create policy "match_report_shared_groups_insert_author"
  on public.match_report_shared_groups
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.match_reports mr
      where mr.id = match_report_shared_groups.match_report_id
        and mr.author_user_id = auth.uid()
    )
  );

create policy "match_report_shared_groups_delete_author"
  on public.match_report_shared_groups
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.match_reports mr
      where mr.id = match_report_shared_groups.match_report_id
        and mr.author_user_id = auth.uid()
    )
  );

create or replace function public.add_group_member_by_email(p_group_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_group_admin(p_group_id) then
    raise exception 'Not authorized';
  end if;

  select id into v_user_id
  from public.profiles
  where email = p_email;

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (p_group_id, v_user_id, 'member')
  on conflict do nothing;
end;
$$;

grant execute on function public.add_group_member_by_email(uuid, text) to authenticated;
