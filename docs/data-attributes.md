# Keystone data attributes

Last updated: July 21, 2026

Keystone is a drop-in browser validator. It discovers forms automatically,
loads project settings from your dashboard, validates native HTML constraints,
and injects accessible inline errors plus an optional error summary.

This guide covers every supported `data-keystone-*` attribute, how settings
combine, and common questions.

## Quick start

Add the script before `</body>` with your project public key from the
dashboard:

```html
<script
  src="https://keystone-web-tmld.vercel.app/keystone/validator.js"
  data-keystone-project="proj_your_public_key"
  defer
></script>
```

Keystone will:

1. Fetch config from `/api/public/config/:publicKey`
2. Attach validation to every `<form>` (unless opted out)
3. Initialize automatically when the script loads

## How settings combine

When a field fails validation, message copy is resolved in this order:

1. **Field attribute** — `data-keystone-message-*` on that input
2. **Project kind override** — dashboard messages for name, phone, url, or
   email fields (inferred from type, name, id, or autocomplete)
3. **Project rule message** — dashboard messages for required, email,
   minLength, maxLength, etc.
4. **Built-in kind default** — sensible copy for inferred field types (name,
   email, phone, …)
5. **Built-in generic default** — Keystone fallback copy

Validation mode, error summary, native validation, and error field colors come
from **saved project settings** in the dashboard. Account defaults on the
Settings page apply only when creating new projects (not yet persisted).
Per-project settings always win at runtime.

## Script tag attributes

Set these on the `<script>` element that loads `validator.js`.

| Attribute | Required | Description |
| --- | --- | --- |
| `data-keystone-project` | Yes | Public key (`proj_…`) from the dashboard. |

## Form attributes

| Attribute | Purpose |
| --- | --- |
| `data-keystone-ignore-form` | Skip validation and scans for this form. |
| `data-keystone-form-id` | Scan id. Falls back to `id`, `name`, or `form-N`. |

```html
<form data-keystone-form-id="contact-main">
  <!-- fields -->
</form>

<form data-keystone-ignore-form>
  <!-- newsletter signup handled elsewhere -->
</form>
```

## Field attributes

### Opt out

| Attribute | Purpose |
| --- | --- |
| `data-keystone-ignore` | Skip validation for one field. |

### Custom error messages

Use `data-keystone-message-{rule}` where `{rule}` matches the failed validation
rule. In HTML, use kebab-case:

| Attribute | When it applies |
| --- | --- |
| `data-keystone-message-required` | Field is required and empty. |
| `data-keystone-message-email` | `type="email"` value is invalid. |
| `data-keystone-message-minlength` | Value is shorter than `minlength`. |
| `data-keystone-message-maxlength` | Value is longer than `maxlength`. |
| `data-keystone-message-pattern` | Value does not match `pattern`. |

Field attributes beat dashboard copy and all built-in defaults.

```html
<input
  name="postal"
  pattern="[0-9]{5}"
  required
  data-keystone-message-pattern="Enter a 5-digit postal code."
/>
```

Pattern messages are field-specific. Set them on the input; there is no
project-level pattern message in the dashboard (the validator uses a built-in
fallback if none is set).

## What Keystone reads from HTML (no data attributes)

Keystone infers rules from native attributes:

| HTML | Validation rule |
| --- | --- |
| `required` | required |
| `type="email"` | email |
| `minlength` | minLength |
| `maxlength` | maxLength |
| `pattern` | pattern |

It also infers field kinds (name, phone, url, email, …) from `type`,
`autocomplete`, `name`, and `id` to pick kind-specific copy when project
settings provide it.

## Validation behavior (project settings)

Configured in the dashboard per project — not via data attributes:

| Setting | Values | Effect |
| --- | --- | --- |
| Validation mode | Submit / Blur + submit | When interactive validation runs. |
| Error summary | Enabled / Disabled | Focusable error list on blocked submit. |
| Native validation | Disabled / Enabled | Sets `novalidate` when disabled. |

## CSS classes and injected markup

Keystone adds classes and elements you can style on your site:

| Class / marker | Applied to |
| --- | --- |
| `.keystone-field-invalid` | Invalid inputs (also sets `aria-invalid="true"`) |
| `.keystone-field-error` | Inline error `<p>` inserted after the field |
| `.keystone-error-summary` | Error summary container prepended to the form |
| `[data-keystone-error-summary]` | Same summary element (for test hooks) |

Invalid field background colors can be customized per project in the dashboard
(WCAG AA contrast checked against the default error text color).

## FAQ

### Do I need a data attribute on every field?

No. Keystone discovers forms and infers rules from standard HTML. Use data
attributes only to opt out, identify forms for scans, or override messages.

### Why does my dashboard message not appear on an email field?

Make sure you saved the project and the embed script uses the correct
`data-keystone-project` key. Email fields use the dashboard **Email format**
message for email-rule failures and **Required field** for empty required
fields. A field-level `data-keystone-message-*` attribute always wins.

### Can I mix project settings and field overrides?

Yes. Project settings are the baseline; field attributes override per input.
Pattern messages should be set on the field with
`data-keystone-message-pattern`.

### Does Keystone validate on every keystroke?

No. **Blur + submit** validates on `focusout` (after a field has been touched
or after a submit attempt) and always on submit. **Submit only** validates when
the user submits.

### What happens if config cannot be loaded?

The script logs an error and falls back to built-in defaults. In the dashboard
playground, a notice appears when the public config request fails (for example,
if the project is inactive).

### Will Keystone clobber my existing ARIA?

Keystone merges `aria-describedby` to include its error element id. It removes
only the error nodes and invalid state it created when a field becomes valid
again.

### How do markup scans relate to validation?

Keystone checks for missing labels, ungrouped radio/checkbox sets, duplicate
ids, and missing submit controls. Scans are guidance — they do not block form
submission. Save scan results from the dashboard playground.

## Related docs

- [Architecture](./architecture.md) — package layout and config flow
- [Accessibility principles](./accessibility.md) — focus, ARIA, and errors
- [README](../README.md) — install snippet and API routes
