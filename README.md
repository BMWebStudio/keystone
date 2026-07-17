# A11y Form Validator

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

## Current scope

UI routes use demonstration data so the visual system can be reviewed immediately. Auth, live project CRUD, and persisted scan storage are the next wiring steps.
