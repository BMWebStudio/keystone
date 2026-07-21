# Capture workflow (CleanShot X)

Use [CleanShot X URL scheme commands](https://cleanshot.com/docs-api) for README screenshots and the capstone demo recording. CleanShot must be installed on macOS.

## Quick commands

From the repo root (with `npm run dev` running when capturing app pages):

```bash
npm run capture:area          # area screenshot, saves via CleanShot
npm run capture:fullscreen    # full display screenshot
npm run capture:record        # screen recording for demo video
npm run capture:history       # open capture history
```

Pass a page URL as the last argument:

```bash
npm run capture:area -- http://localhost:3000/dashboard/projects
```

Or set `CAPTURE_URL` once:

```bash
CAPTURE_URL=http://localhost:3000/login npm run capture:area
```

## Recommended captures for submission

Save finished files under `docs/screenshots/` with clear names:

| File | Page | CleanShot command |
| --- | --- | --- |
| `landing.png` | `/` | `npm run capture:area -- http://localhost:3000/` |
| `login.png` | `/login` | `npm run capture:area -- http://localhost:3000/login` |
| `projects.png` | `/dashboard/projects` | `npm run capture:area -- http://localhost:3000/dashboard/projects` |
| `project-detail.png` | `/dashboard/projects/:id` | `npm run capture:area -- http://localhost:3000/dashboard/projects/<id>` |

## Demo video (3–5 minutes)

1. Start the app: `npm run dev`
2. Record: `npm run capture:record`
3. In CleanShot, select the browser window or a screen region
4. Walk through: register → login → create project → copy embed snippet → edit → delete (optional)
5. Export from CleanShot history and upload to YouTube or Loom

## Notes

- `action=save` uses your CleanShot save location. Move or rename files into `docs/screenshots/` after each capture.
- For annotated README shots, capture then run `open "cleanshot://open-annotate?filepath=/path/to/file.png"`.
- CleanShot commands are macOS-only. On other platforms, use your OS screenshot tool and save into `docs/screenshots/`.
