# Keystone

Universal accessible form validation for any HTML site—plus a Next.js dashboard and Supabase backend. Unlike the Webflow Designer Extension / OAuth app, this validator is platform-agnostic: drop in one script and it tracks forms wherever they render.

## Included

- Framework-independent browser validator (`packages/keystone-core`)
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

Production deploys target **Vercel**. Link the repo, set the project root to `apps/web`, and configure Supabase env vars in the Vercel dashboard. The root `npm run build` builds keystone-core and the Next.js app.

## Install on any site

```html
<script
  src="https://keystone-web-tmld.vercel.app/keystone/validator.js"
  data-keystone-project="proj_your_public_key"
  defer
></script>
```

The script:

1. Loads remote config from `/api/public/config/:publicKey`
2. Tracks every `<form>` (opt out with `data-keystone-ignore-form`)
3. Validates native constraints (`required`, `type="email"`, `minlength`, `pattern`, …)
4. Scans for missing labels, ungrouped radios/checkboxes, duplicate ids, and missing submit controls

Legacy embed paths and `data-a11y-*` attributes remain supported for backward compatibility.

Attribute reference: [docs/data-attributes.md](docs/data-attributes.md)

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

Product captures for capstone review and README display. See **[docs/screenshots-and-demos.md](docs/screenshots-and-demos.md)** for what each screenshot and recording shows.

| | |
| --- | --- |
| **Landing page** — Public marketing page with brand lockup, hero, and feature overview | **Login** — Sign-in entry with brand icon and auth fields |
| ![Landing page](docs/screenshots/Keystone%20-%2001%20Landing%20page.png) | ![Login page](docs/screenshots/Keystone%20-%2002%20Login%20page.png) |
| **Dashboard** — Authenticated overview with sidebar nav and workspace summary | **Projects** — Project list and create flow |
| ![Dashboard](docs/screenshots/Keystone%20-%2003%20Dashboard.png) | ![Projects](docs/screenshots/Keystone%20-%2004%20Projects.png) |

**Project detail** — Validation messages, error colors, and embed snippet for one project.

![Project detail](docs/screenshots/Keystone%20-%2005%20Project%20page.png)

**Demo recordings** (linked in [screenshots-and-demos.md](docs/screenshots-and-demos.md)):

- [Landing and dashboard walkthrough](docs/screenshots/Keystone%20-%2010%20Landing%20and%20Dashboard.mp4) — Public site through sign-in into the dashboard
- [Active site validation](docs/screenshots/Keystone%20-%2011%20Active%20Site.mp4) — Embed script validating forms on a live page

## Current scope

Auth and project CRUD are wired to Supabase. Scan history persistence and dashboard metrics from live data are next.
