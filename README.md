# Keystone

Universal accessible form validation for any HTML site—plus a Next.js dashboard and Supabase backend. Unlike the Webflow Designer Extension / OAuth app, this validator is platform-agnostic: drop in one script and it tracks forms wherever they render.

## Included

- Framework-independent browser validator (`packages/validator-core`)
- Drop-in script that discovers forms, validates fields, and scans for broken markup
- BM Web Studio–inspired dashboard (projects, scans, playground, settings)
- Supabase schema, RLS, and public project config API
- Plain HTML integration example

## Start

```bash
cp apps/web/.env.example apps/web/.env.local
npm install
npm run dev
```

Apply `supabase/migrations/*.sql`, then set Supabase env vars.

## Deploy

Production deploys target **Vercel**. Link the repo, set the project root to `apps/web`, and configure Supabase env vars in the Vercel dashboard. The root `npm run build` builds validator-core and the Next.js app.

## Install on any site

```html
<script
  src="http://localhost:3000/validator/a11y-validator.js"
  data-a11y-project="proj_your_public_key"
  defer
></script>
```

The script:

1. Loads remote config from `/api/public/config/:publicKey`
2. Tracks every `<form>` (opt out with `data-a11y-ignore-form`)
3. Validates native constraints (`required`, `type="email"`, `minlength`, `pattern`, …)
4. Scans for missing labels, ungrouped radios/checkboxes, duplicate ids, and missing submit controls

## Projects API

Authenticated REST endpoints (Next.js Route Handlers + Supabase RLS):

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/projects` | List your projects |
| `POST` | `/api/projects` | Create a project (+ default settings) |
| `GET` | `/api/projects/:id` | Get one project |
| `PUT` | `/api/projects/:id` | Update project + settings |
| `DELETE` | `/api/projects/:id` | Delete a project |

Dashboard UI: `/dashboard/projects` (create, list, edit, delete, copy embed snippet).

## Screenshots and demo video

Use CleanShot X URL schemes on macOS. See [docs/capture-workflow.md](docs/capture-workflow.md) and the [CleanShot API docs](https://cleanshot.com/docs-api).

```bash
npm run capture:area -- http://localhost:3000/dashboard/projects
npm run capture:record
```

Save captures under `docs/screenshots/` for README and capstone submission.

## Current scope

Auth and project CRUD are wired to Supabase. Scan history persistence and dashboard metrics from live data are next.
