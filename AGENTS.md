# AGENTS.md

## Cursor Cloud specific instructions

This is an npm **workspaces** monorepo (Node 22, npm 10). Dependencies for all workspaces install from the repo root with a single `npm install` (the update script already runs this on startup).

### Services / how to run
- **`apps/web`** — Next.js 15 dashboard + validator host + public config API. Run `npm run dev` from the repo root (delegates to the `@a11y/web` workspace) and it serves on `http://localhost:3000`. Standard scripts live in `apps/web/package.json` (`dev`, `build`, `start`, `lint`).
- **`packages/validator-core`** — framework-independent browser JS library. You normally do **not** build it manually: `apps/web`'s `predev`/`prebuild` hooks automatically build validator-core and sync the drop-in `a11y-validator.js` into `apps/web/public/validator/`. Build/test it directly with `npm run build` / `npm test` in that package (tests use the Node built-in runner, `node --test`).

### Non-obvious gotchas
- **Lint is not configured.** `npm run lint` (`next lint`) has no committed ESLint config, so it drops into an interactive setup prompt and fails in non-interactive shells. Type checking still runs as part of `npm run build`.
- **Supabase is optional and not wired into the UI.** The dashboard, playground, and login pages render static demo data and need no Supabase credentials. Only the public config API route (`/api/public/config/[publicKey]`) touches Supabase; with empty/placeholder env vars it returns 500/404, which is expected. To exercise real config lookups, set the four vars in `apps/web/.env.local` (see `apps/web/.env.example`) and apply `supabase/migrations/*.sql`.
- **No auth.** The `/login` page is a static demo form; there are no real auth calls, so no login/account is required to run or test the app.
- Good smoke-test of core functionality: the **playground** at `/dashboard/playground` runs the accessible form-validation flow (error summary + inline errors) entirely client-side.
