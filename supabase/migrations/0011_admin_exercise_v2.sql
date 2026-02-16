-- Admin-only helper for creating global exercises with extended fields

create or replace function public.admin_create_global_exercise_v2(
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
returns uuid
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_id uuid;
begin
  if not public.is_system_admin() then
    raise exception 'Not authorized';
  end if;

  insert into public.exercises (
    title,
    description,
    how_to,
    mode,
    metrics_type,
    numeric_unit,
    category,
    visibility,
    created_by,
    image_url,
    focus_areas,
    variants,
    players_min,
    players_max,
    area_size
  )
  values (
    p_title,
    p_description,
    p_how_to,
    coalesce(p_mode, 'solo'),
    coalesce(p_metrics_type, 'rating'),
    p_numeric_unit,
    p_category,
    'global',
    auth.uid(),
    p_image_url,
    p_focus_areas,
    p_variants,
    p_players_min,
    p_players_max,
    p_area_size
  )
  returning id into v_id;

  return v_id;
end;
$$;
