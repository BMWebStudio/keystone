-- Default new projects to blur + submit (WCAG-friendly).
-- Migrate legacy change mode to blur.

alter table public.project_settings
  alter column validation_mode set default 'blur';

update public.project_settings
set validation_mode = 'blur'
where validation_mode = 'change';
