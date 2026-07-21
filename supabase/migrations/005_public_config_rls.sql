-- Public embed config with Supabase-recommended security_invoker = on.
-- Anon callers (public Route Handler + REST) read only active project config
-- through RLS instead of bypassing it via security_invoker = false.

drop policy if exists "anon read active projects for public config" on public.projects;
drop policy if exists "anon read settings for active projects" on public.project_settings;

create policy "anon read active projects for public config"
on public.projects
for select
to anon
using (is_active = true);

create policy "anon read settings for active projects"
on public.project_settings
for select
to anon
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.is_active = true
  )
);

-- security_invoker views require invoker SELECT on underlying tables.
-- Column grants limit direct REST access to config-related fields only.
grant select (id, public_key, is_active) on table public.projects to anon;

grant select (
  project_id,
  validation_mode,
  show_error_summary,
  focus_error_summary,
  disable_native_validation,
  messages,
  error_colors
) on table public.project_settings to anon;

drop view if exists public.public_project_configs;

create view public.public_project_configs
with (security_invoker = on)
as
select
  p.public_key,
  p.is_active,
  s.validation_mode,
  s.show_error_summary,
  s.focus_error_summary,
  s.disable_native_validation,
  s.messages,
  s.error_colors
from public.projects p
join public.project_settings s on s.project_id = p.id;

grant select on table public.public_project_configs to anon, authenticated, service_role;
