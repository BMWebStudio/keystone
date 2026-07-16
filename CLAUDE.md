# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root unless noted.

```bash
# Install
npm install

# Dev server (Next.js app)
npm run dev                    # runs from apps/web automatically via root package.json

# Or run directly
cd apps/web && npm run dev

# Build
cd apps/web && npm run build

# Lint
cd apps/web && npm run lint

# validator-core (no bundler yet — build just copies src to dist)
cd packages/validator-core && npm run build

# validator-core tests (Node built-in test runner)
cd packages/validator-core && npm test
```

## Architecture

Two independent layers that share no runtime code:

### `packages/validator-core`
Framework-independent browser JavaScript. No React, no Next.js, no Supabase dependencies.

- `src/index.js` — `createValidator(options?)` factory. Attaches submit/blur listeners to `form[data-a11y-form]` elements. Injects `<p class="a11y-field-error">` inline errors and a `<div data-a11y-error-summary>` summary block. Manages `aria-invalid` and `aria-describedby` without clobbering existing references.
- `src/rules.js` — `inferRules(field)` derives which rules to run from native HTML attributes (`required`, `type="email"`, `minlength`, `maxlength`, `pattern`). `rules` map contains the validators.
- Custom error messages via `data-a11y-message-{rule}` attributes on fields, or global `messages` option.
- Also exposes `window.A11yFormValidator` for plain `<script>` usage.
- Build is a manual `cp src/*.js dist/` — no bundler yet. tsup is planned.

### `apps/web`
Next.js 15 / React 19 / TypeScript dashboard. App Router only.

- **`src/lib/supabase/`** — two Supabase clients: `client.ts` (browser, `createBrowserClient`) and `server.ts` (RSC/Route Handlers, `createServerClient` via `@supabase/ssr`). Always use the server client in Server Components and Route Handlers.
- **`src/app/api/public/config/[publicKey]/route.ts`** — the only public Route Handler. Reads from the `public_project_configs` view (no auth required). Returns project validation config keyed by `public_key`. Used by the browser validator to fetch remote config.
- **`src/app/dashboard/`** — authenticated area. Currently uses demo/static data. Auth integration is pending.
- **`src/components/`** — three layers: `ui/` (Button, Card, Badge), `layout/` (AppShell, PageHeader), `app/` (MetricCard, IssueCard). CSS Modules per component.
- **`src/styles/tokens.css`** — design tokens (BM Web Studio–inspired). All component styles reference these tokens.

### Supabase schema (`supabase/migrations/001_initial_schema.sql`)
Key tables: `profiles`, `projects`, `project_settings`, `form_configs`, `scan_results`, `validation_events`.

- `projects` has a `public_key` (`proj_` + 9 random hex bytes) used as the public API identifier.
- `public_project_configs` is a view joining `projects` + `project_settings` — this is what the public Route Handler queries.
- All tables have RLS. `validation_events` is insert-only from clients (select only for owner).
- `handle_new_user` trigger auto-creates a `profiles` row on `auth.users` insert.

## Environment

Copy `.env.example` to `.env.local` in `apps/web/`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Apply the migration to your Supabase project before running.

## What's scaffolded but not yet wired

- Login page exists (`/login`) but Supabase Auth calls are not implemented.
- Dashboard data is static demo data — no authenticated Supabase queries yet.
- No Server Actions — CRUD for projects/settings is planned with Zod.
- `validator-core` has no tsup build, no Vitest/axe-core tests.
- No Playwright or React Testing Library setup.
