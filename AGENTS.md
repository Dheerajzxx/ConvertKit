# AGENTS.md

## What this repo is

**ConvertKit** — a free, fully client-side document/file converter website. Intended stack: HTML5, CSS3, vanilla JavaScript (ES modules), deployed to GitHub Pages. **No backend, no database, no uploads.**

## Current state: greenfield

Only `GOAL.md` exists. There is no code, `package.json`, build system, or tooling yet.
`GOAL.md` is the source of truth for scope, folder layout (section 4), per-tool specs (section 7), SEO, testing, and deployment. Read it before adding anything.

## Hard constraints (do not violate)

- **No build step, no bundler, no npm/runtime dependencies.** Vanilla ES modules only. No framework.
- **Privacy invariant:** no `fetch`/XHR/analytics/network call may carry file data. All processing happens in the browser. This is the product's core promise (`privacy.html`, GOAL.md section 9) — verify changes in the Network tab.
- **CDN libraries pinned to exact versions**, never `@latest`, and loaded only on pages that need them (e.g. Merge PDF must not load SheetJS). Record each license in `THIRD_PARTY_LICENSES.md`.
- **Relative asset paths** (`../assets/...`). The site may be served from `username.github.io/repo-name/`, so root-absolute paths break under GitHub Pages.
- **Sanitize all HTML derived from user files** (DOMPurify or a sandboxed iframe). Never `eval` or pass untrusted strings to `innerHTML`. Validate file type by MIME **and** extension; check size before reading.

## Conventions

- One HTML page per tool under `tools/`; one script per tool under `assets/js/tools/`; shared helpers in `assets/js/common.js`.
- Every tool follows the same flow, built on shared `common.js` helpers (`setupDropzone`, `validateFile`, `downloadBlob`, `formatBytes`, `showToast`, `setBusy`): **dropzone -> options -> convert -> download**. Follow the pattern in GOAL.md section 6 when adding a tool.
- Styles live in `assets/css/` (`base.css` tokens, `layout.css`, `components.css`). Reuse design tokens/section 5A rather than hardcoding values.
- Build Merge PDF first as the reference implementation, then reuse for other tools.

## Local development

No build/run command. Serve the directory with any static server (e.g. VS Code Live Server) — `file://` breaks ES modules and Web Workers.

## Deployment

Push to `main`; GitHub Pages serves from repo root and auto-redeploys on every merge. Add `.nojekyll` if Jekyll interferes. A `404.html` is required for custom not-found handling.

## Testing

No automated suite exists. Per-tool manual checklist is in GOAL.md section 10 (happy path, wrong/empty/corrupted/password-protected files, large files, Unicode filenames, cross-browser incl. Safari/iOS quirks). Optional: Playwright/Cypress smoke tests + GitHub Actions HTML-validation/link-check workflows.
