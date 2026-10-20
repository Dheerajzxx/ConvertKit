# ConvertKit

A free, fully client-side document and file converter. Every tool runs in your
browser — there is no backend, no database and no upload. Your files never leave
your device.

Live site: _deployed via GitHub Pages_ (update this with your URL once deployed).

## Features

- **PDF** — merge, split, rotate, extract text, images → PDF, PDF → images
- **Images** — convert between PNG / JPG / WebP, compress and resize
- **Data** — CSV ↔ JSON, Excel → CSV/JSON
- **Documents** — Word → HTML, Markdown → HTML with a live preview

All processing uses open-source libraries that are self-hosted and pinned to
exact versions (see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)).

## Tech

Plain HTML5, CSS3 and vanilla JavaScript ES modules.

- **No build step, no bundler, no npm dependency.**
- No framework.
- No network requests carrying file data — enforced by a Content-Security-Policy
  meta tag on every page and verifiable in your browser's Network tab.

## Project layout

```
.
├── index.html              # Home page (tool grid, search, recently used)
├── about.html privacy.html terms.html contact.html 404.html
├── robots.txt sitemap.xml
├── .nojekyll               # keeps GitHub Pages from processing the site with Jekyll
├── assets/
│   ├── css/                # base.css (tokens), layout.css, components.css
│   ├── img/                # favicon + social images
│   ├── js/
│   │   ├── common.js       # shared helpers, header/footer, tool registry
│   │   ├── theme.js        # pre-paint light/dark theme
│   │   ├── home.js         # home page rendering + search
│   │   └── tools/          # one script per tool
│   └── vendor/             # pinned third-party libraries
└── tools/                  # one HTML page per tool
```

## Local development

The tools use ES modules and Web Workers, so they will **not** work over
`file://`. Serve the folder with any static server:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Deployment

The site is designed for GitHub Pages serving from the repository root:

1. Push to the `main` branch.
2. In the repository settings, set Pages to deploy from the `main` branch, `/` root.
3. GitHub re-deploys automatically on every merge to `main`.

`.nojekyll` is present so Jekyll does not interfere with files and folders that
begin with an underscore.

### Before you deploy

The deployment domain is a placeholder in two files. Replace
`https://example.github.io/ConvertKit/` with your real Pages URL in:

- `sitemap.xml` (every `<loc>`)
- `robots.txt` (the `Sitemap:` line)

All other links use relative paths, so they work whether the site is served from
`username.github.io/repo-name/` or a custom domain.

## Testing

There is no automated test suite yet. Per-tool manual checks (happy path,
wrong/empty/corrupted/password-protected files, large files, Unicode filenames,
Safari/iOS) are listed in `GOAL.md` section 10.

Quick checks while developing:

```sh
# Syntax-check every module
find assets/js -name '*.js' -print0 | xargs -0 -n1 node --check

# Verify pages respond with 200
for p in index.html about.html tools/merge-pdf.html; do
  curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" "http://localhost:8000/$p"
done
```

## Privacy

ConvertKit collects nothing about your files. See [privacy.html](privacy.html)
for the full promise.

## Licence

The site's own code is released under the [MIT Licence](LICENSE). Bundled
libraries keep their own licences — see
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
