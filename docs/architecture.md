# Architecture

Two layers that share no runtime UI framework:

1. **`packages/keystone-core`** — universal browser JavaScript. Works on Webflow, WordPress, plain HTML, React, or any page with forms. No React, Next.js, Supabase, or Webflow Designer APIs required.
2. **`apps/web`** — Next.js dashboard + public config API that hosts `/keystone/validator.js` and project settings.

Native HTML semantics are inferred first; optional `data-keystone-*` attributes customize messages and behavior (`data-a11y-*` remains supported). Forms are discovered automatically; mark a form with `data-keystone-ignore-form` to skip it.
