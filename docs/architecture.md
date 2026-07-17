# Architecture

Two layers that share no runtime UI framework:

1. **`packages/validator-core`** — universal browser JavaScript. Works on Webflow, WordPress, plain HTML, React, or any page with forms. No React, Next.js, Supabase, or Webflow Designer APIs required.
2. **`apps/web`** — Next.js dashboard + public config API that hosts `/validator/a11y-validator.js` and project settings.

Native HTML semantics are inferred first; optional `data-a11y-*` attributes customize messages and behavior. Forms are discovered automatically; mark a form with `data-a11y-ignore-form` to skip it.
