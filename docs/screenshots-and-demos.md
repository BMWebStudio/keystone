# Screenshots and demo recordings

Product captures for README, capstone submission, and reviewer walkthroughs. All files live in [`screenshots/`](./screenshots/).

**Date:** July 21, 2026

---

## Screenshots

### 01 — Landing page

**File:** [`Keystone - 01 Landing page.png`](./screenshots/Keystone%20-%2001%20Landing%20page.png)

Public marketing page for Keystone. Shows the BM brand lockup, hero hierarchy (product name, descriptor, tagline), sign-in/register navigation, and the three-column feature list. Use this capture to illustrate first impressions and the platform-independent positioning.

![Landing page](./screenshots/Keystone%20-%2001%20Landing%20page.png)

---

### 02 — Login page

**File:** [`Keystone - 02 Login page.png`](./screenshots/Keystone%20-%2002%20Login%20page.png)

Sign-in screen with compact brand icon, email and password fields, and link to registration. Demonstrates auth entry point and consistent brand treatment outside the dashboard shell.

![Login page](./screenshots/Keystone%20-%2002%20Login%20page.png)

---

### 03 — Dashboard overview

**File:** [`Keystone - 03 Dashboard.png`](./screenshots/Keystone%20-%2003%20Dashboard.png)

Authenticated workspace overview after login. Shows the sidebar product identity (Keystone title, descriptor, primary nav, instructions link, log out), greeting, and summary metrics. Use this to show the dashboard shell and information architecture.

![Dashboard overview](./screenshots/Keystone%20-%2003%20Dashboard.png)

---

### 04 — Projects list

**File:** [`Keystone - 04 Projects.png`](./screenshots/Keystone%20-%2004%20Projects.png)

Projects index with create/list flows. Each project maps to a public key used by the embed script. Shows how users manage multiple validation configs from one account.

![Projects list](./screenshots/Keystone%20-%2004%20Projects.png)

---

### 05 — Project detail

**File:** [`Keystone - 05 Project page.png`](./screenshots/Keystone%20-%2005%20Project%20page.png)

Single-project settings panel: validation messages, error field colors with live preview, installation snippet, and related project controls. Use this to show how dashboard settings flow to the public config API and remote validator.

![Project detail](./screenshots/Keystone%20-%2005%20Project%20page.png)

---

## Demo recordings

### 10 — Landing and dashboard walkthrough

**File:** [`Keystone - 10 Landing and Dashboard.mp4`](./screenshots/Keystone%20-%2010%20Landing%20and%20Dashboard.mp4)

End-to-end screen recording from the public landing page through sign-in into the dashboard. Intended for capstone reviewers who want a quick tour of the product surface area without running the app locally.

---

### 11 — Active site validation

**File:** [`Keystone - 11 Active Site.mp4`](./screenshots/Keystone%20-%2011%20Active%20Site.mp4)

Demonstrates Keystone running on a live site with real form markup. Shows how the embed script loads project config, validates fields, and surfaces accessible inline errors—highlighting the platform-independent use case outside the Next.js dashboard.

---

## Related docs

- [Architecture](./architecture.md) — system layers and data flow
- [Data attributes](./data-attributes.md) — field-level overrides and form opt-out
- [Accessibility](./accessibility.md) — WCAG-informed validation patterns
