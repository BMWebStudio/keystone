-- Allow anonymous reads of active project config via the public view.
-- security_invoker=true blocked the public Route Handler under RLS.

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
  s.messages
from public.projects p
join public.project_settings s on s.project_id = p.id;

grant select on public.public_project_configs to anon, authenticated;

-- NOTE: security_invoker = false bypasses RLS (Supabase linter warning).
-- Fixed in 005_public_config_rls.sql with anon policies + security_invoker = on.

-- Allow the hosted validator to record anonymized validation events.
create policy "events insert for active public projects"
on public.validation_events
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.is_active = true
  )
);
