-- Brand-customizable field-level error background colors per project.
-- View uses security_invoker = false here; 005_public_config_rls.sql switches to on + anon RLS.

alter table public.project_settings
  add column if not exists error_colors jsonb not null default '{}'::jsonb;

drop view if exists public.public_project_configs;

create view public.public_project_configs
with (security_invoker = false)
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

grant select on public.public_project_configs to anon, authenticated;
