-- Admin-only helpers for updating/deleting exercises (including global visibility)

create or replace function public.admin_update_exercise_v2(
  p_exercise_id uuid,
  p_title text,
  p_description text,
  p_how_to text,
  p_mode public.exercise_mode,
  p_metrics_type public.exercise_metrics_type,
  p_numeric_unit text,
  p_category text,
  p_image_url text,
  p_focus_areas text,
  p_variants text,
  p_players_min int,
  p_players_max int,
  p_area_size text
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if not public.is_system_admin() then
    raise exception 'Not authorized';
  end if;

  update public.exercises
  set
    title = p_title,
    description = p_description,
    how_to = p_how_to,
    mode = coalesce(p_mode, mode),
    metrics_type = coalesce(p_metrics_type, metrics_type),
    numeric_unit = p_numeric_unit,
    category = p_category,
    image_url = p_image_url,
    focus_areas = p_focus_areas,
    variants = p_variants,
    players_min = p_players_min,
    players_max = p_players_max,
    area_size = p_area_size
  where id = p_exercise_id;
end;
$$;

create or replace function public.admin_delete_exercise(p_exercise_id uuid)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if not public.is_system_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.exercises where id = p_exercise_id;
end;
$$;
