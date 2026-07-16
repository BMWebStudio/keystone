# A11y Form Validator

A full-stack bootcamp capstone foundation combining a reusable accessible form-validation engine with a custom Next.js dashboard and Supabase backend.

## Included

- BM Web Studio–inspired design tokens and responsive app shell
- Reusable UI, form, layout, and product components
- Landing page, dashboard, project detail, login, and interactive playground
- Framework-independent JavaScript validator
- Supabase PostgreSQL schema, indexes, trigger, and Row Level Security
- Public configuration Route Handler
- Plain HTML integration example

## Start

```bash
cp apps/web/.env.example apps/web/.env.local
npm install
npm run dev
```

Add Supabase environment variables and apply `supabase/migrations/001_initial_schema.sql`.

## Current scope

This is a polished working foundation. UI routes use demonstration data so the visual system can be reviewed immediately. The database, Supabase clients, public configuration route, and browser validator are scaffolded for integration.

## Next implementation tasks

1. Connect login/registration to Supabase Auth.
2. Replace dashboard demo data with authenticated queries.
3. Add project Server Actions with Zod validation.
4. Bundle `validator-core` with tsup.
5. Add Vitest, React Testing Library, Playwright, and axe-core.
6. Implement scan-rule modules and persisted reports.
