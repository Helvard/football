-- Add coach role to group_role enum
-- Must be run in its own transaction before any SQL that references the new value.

alter type public.group_role add value if not exists 'coach';
