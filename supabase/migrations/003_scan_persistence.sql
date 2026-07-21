-- Table privileges for app roles (fixes permission denied on REST/service access).
-- Safe to re-run: GRANT is idempotent.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to authenticated, service_role;
grant select, insert, update, delete on table public.projects to authenticated, service_role;
grant select, insert, update, delete on table public.project_settings to authenticated, service_role;
grant select, insert, update, delete on table public.form_configs to authenticated, service_role;
grant select, insert, update, delete on table public.scan_results to authenticated, service_role;
grant select, insert on table public.validation_events to authenticated, service_role;
grant select, insert on table public.validation_events to anon;

grant select on table public.public_project_configs to anon, authenticated, service_role;
