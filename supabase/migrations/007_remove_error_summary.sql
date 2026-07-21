-- Validation is field-level only; remove form error summary settings.

drop view if exists public.public_project_configs;

alter table public.project_settings
  drop column if exists show_error_summary,
  drop column if exists focus_error_summary;

revoke all on table public.project_settings from anon;

grant select (
  project_id,
  validation_mode,
  disable_native_validation,
  messages,
  error_colors
) on table public.project_settings to anon;

create view public.public_project_configs
with (security_invoker = on)
as
select
  p.public_key,
  p.is_active,
  s.validation_mode,
  s.disable_native_validation,
  s.messages,
  s.error_colors
from public.projects p
join public.project_settings s on s.project_id = p.id;

grant select on table public.public_project_configs to anon, authenticated, service_role;
