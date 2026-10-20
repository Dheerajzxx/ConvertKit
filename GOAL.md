# Document Converter Toolkit: Development Plan

A free, fully client-side document and file converter website built with **HTML, CSS and JavaScript only**, hosted on **GitHub Pages**. No backend, no database, no uploads. Every file is processed inside the user's browser.

---

## 1. Project Overview

| Item | Decision |
|---|---|
| Name | *ConvertKit*. Check domain and GitHub repo name availability |
| Type | Multi-page static website (one page per tool) |
| Stack | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Hosting | GitHub Pages (free, HTTPS included) |
| Backend | None |
| Core selling point | "Your files never leave your device" |
| Target users | Students, job seekers, office workers, small businesses |

### Goals
1. Ship a fast, clean, mobile-friendly toolkit of reliable converters.
2. Rank on search engines through one focused page per tool.
3. Keep maintenance close to zero (static files, pinned libraries).

### Non-goals (for v1)
- Accurate PDF → Word and Word → PDF (needs a server)
- Video/audio conversion
- User accounts, cloud storage, history
- Server-side processing of any kind

---

## 2. Feature Scope

### Phase 1: Core tools (MVP)
| # | Tool | Library | Difficulty |
|---|---|---|---|
| 1 | Image → PDF | jsPDF or pdf-lib | Easy |
| 2 | Merge PDF | pdf-lib | Easy |
| 3 | Split PDF (by range / extract pages) | pdf-lib | Easy |
| 4 | PDF → Images (JPG/PNG) | pdf.js | Medium |
| 5 | Image converter (PNG ↔ JPG ↔ WebP) | Canvas API | Easy |
| 6 | Image compressor and resizer | Canvas API (or browser-image-compression) | Easy |
| 7 | CSV ↔ JSON | PapaParse | Easy |
| 8 | Excel ↔ CSV / JSON | SheetJS | Medium |

### Phase 2: Extended tools
| # | Tool | Library | Difficulty |
|---|---|---|---|
| 9 | Word (.docx) → HTML / Text | mammoth.js | Medium |
| 10 | Markdown → HTML | marked | Easy |
| 11 | Markdown / HTML → PDF | html2pdf.js or `window.print()` | Medium |
| 12 | PDF → Text | pdf.js | Medium |
| 13 | Rotate / reorder / delete PDF pages | pdf-lib | Medium |
| 14 | HEIC → JPG | heic2any | Easy |
| 15 | HTML → Markdown | turndown | Easy |
| 16 | PDF watermark and page numbers | pdf-lib | Medium |

### Phase 3: Optional / later
- Zip / unzip (JSZip)
- Basic PDF → Word (text only, via pdf.js + `docx` library), clearly labelled "text only, layout not preserved"
- QR code generator, Base64 encoder, and other small utilities (good for SEO)

---

## 3. Tech Stack and Libraries

All libraries load from a CDN with **exact pinned versions**. Pick versions that are at least two weeks old, and verify the current version on cdnjs/jsDelivr before use.

| Library | Used for | CDN |
|---|---|---|
| pdf-lib | Merge, split, rotate, create PDFs | cdnjs / jsDelivr |
| pdf.js (pdfjs-dist) | Render PDF pages, extract text | cdnjs / jsDelivr |
| jsPDF | Images and HTML to PDF | cdnjs |
| SheetJS (xlsx) | Excel read/write | cdnjs |
| PapaParse | CSV parse/unparse | cdnjs |
| mammoth.js | docx → HTML | cdnjs / jsDelivr |
| marked | Markdown → HTML | cdnjs / jsDelivr |
| JSZip | Download many files as one ZIP | cdnjs |
| FileSaver.js (optional) | Reliable downloads (or use the `<a download>` approach) | cdnjs |

**Rules**
- Pin every version, never `@latest`.
- Load a library only on pages that need it (the Merge PDF page does not load SheetJS).
- Note each library's license in a `THIRD_PARTY_LICENSES.md` file.
- Optional: download the libraries into `/assets/vendor/` so the site works even if a CDN is down. This also lets you add Subresource Integrity (SRI) hashes.

---

## 4. Folder Structure

```
/
├── index.html                 # Home: grid of all tools
├── about.html
├── privacy.html               # "Files never leave your device" explanation
├── terms.html
├── contact.html
├── 404.html                   # Custom not-found page (GitHub Pages supports it)
├── sitemap.xml
├── robots.txt
├── CNAME                      # Only if using a custom domain
├── README.md
├── LICENSE
├── THIRD_PARTY_LICENSES.md
├── DEVELOPMENT_PLAN.md
├── tools/
│   ├── image-to-pdf.html
│   ├── merge-pdf.html
│   ├── split-pdf.html
│   ├── pdf-to-image.html
│   ├── image-converter.html
│   ├── image-compressor.html
│   ├── csv-to-json.html
│   ├── json-to-csv.html
│   ├── excel-to-csv.html
│   ├── docx-to-html.html
│   ├── markdown-to-html.html
│   └── ...
├── assets/
│   ├── css/
│   │   ├── base.css           # Reset, variables, typography
│   │   ├── layout.css         # Header, footer, grid
│   │   ├── components.css    # Buttons, dropzone, cards, progress bar
│   │   └── dark.css           # Dark theme overrides (optional)
│   ├── js/
│   │   ├── common.js          # Dropzone, file validation, download helper, toasts
│   │   ├── theme.js           # Dark/light toggle
│   │   ├── nav.js             # Mobile menu
│   │   └── tools/
│   │       ├── image-to-pdf.js
│   │       ├── merge-pdf.js
│   │       └── ...            # One script per tool
│   ├── vendor/                # Optional: self-hosted libraries
│   └── img/                   # Logo, favicon, OG images, icons
└── .github/
    └── workflows/             # Optional: link checker, HTML validation
```

**Why one page per tool:** each page gets its own title, description and keywords ("merge pdf online free"), which is the main SEO advantage over a single-page app.

---

## 5. Design and UX Plan

### Layout
- **Header:** logo, tool category links (PDF, Image, Data, Document), theme toggle
- **Home page:** hero line, search box to filter tools, grid of tool cards grouped by category
- **Tool page:** title, one-line description, dropzone, options panel, action button, result and download area, short "How to use" section, FAQ
- **Footer:** About, Privacy, Terms, Contact, GitHub link

### Standard tool page flow
1. User drops files or clicks "Choose files"
2. File list appears with name, size, thumbnail or page count, and a remove button
3. Options are shown (quality, page range, output format, and so on)
4. User clicks **Convert**
5. A progress bar or spinner shows while processing
6. A **Download** button appears, with file size and a "Convert another" reset

### Design principles
- Mobile-first, responsive (test at 360px, 768px, 1280px)
- Large dropzone with clear drag-over state
- One primary action per page
- Accessible: keyboard navigation, `aria-live` for status messages, visible focus, colour contrast of at least 4.5:1, labels on every input
- Light and dark theme using CSS variables, respecting `prefers-color-scheme`
- Use system fonts or one Google Font with a proper fallback stack
- Consistent iconography (inline SVG, no icon font needed)

### Reusable components
Dropzone, file list item, progress bar, toast/alert, button variants, tool card, option controls (select, slider, toggle), modal (optional), FAQ accordion.

---

## 5A. Premium UI/UX Plan

Section 5 covers the basics. This section is what makes the site feel like a polished product rather than a utility page. Build it on top of the shared components so every tool inherits it automatically.

### 5A.1 Design principles
- **Calm and focused:** one clear action per screen, generous whitespace, no clutter or pop-ups
- **Instant feedback:** every click, hover, drag and completion gets a visible response within 100 ms
- **Trust by design:** the privacy promise is visible on every tool page, not hidden in the footer
- **Consistent:** same spacing, radius, shadows and motion everywhere
- **Fast:** premium feel needs speed; keep animations on `transform` and `opacity` only (GPU friendly)

### 5A.2 Design tokens (CSS variables in `base.css`)
| Token group | Recommendation |
|---|---|
| Colours | One brand colour (e.g. indigo or violet) with a 9-step scale (50 to 900), a neutral gray scale, and semantic colours (success, warning, error, info) |
| Surfaces | Layered surfaces: background, card, elevated card, overlay. Each defined for light and dark |
| Typography | One modern variable font (Inter, Plus Jakarta Sans or Manrope) with a font-display fallback; a modular type scale (12, 14, 16, 18, 20, 24, 32, 48, 64) using `clamp()` for fluid headings |
| Spacing | 4px base grid (4, 8, 12, 16, 24, 32, 48, 64, 96) |
| Radius | Small 8px, medium 12px, large 20px, pill 999px |
| Shadows | 3 soft elevation levels (subtle, medium, large) with low-opacity, multi-layer shadows; lighter shadows in dark mode, relying on borders instead |
| Borders | 1px hairline borders with low-contrast colours |
| Motion | Durations 120ms, 200ms, 320ms; easing `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrances and `ease-in` for exits |

### 5A.3 Visual style
- Modern, minimal look with soft gradients used sparingly (hero, primary button, tool icons)
- Subtle glass effect (`backdrop-filter`) only on the sticky header and modals, with a solid fallback
- Each tool category gets its own accent colour and a custom inline-SVG icon (PDF, Image, Data, Document) in a consistent stroke style
- Optional soft background grain or a faint gradient mesh in the hero
- Custom logo, favicon set and Open Graph image so shared links look professional
- Light and dark themes both designed carefully (not just inverted), with a theme toggle that remembers the choice

### 5A.4 Home page
- Hero: clear headline, one-line subheading, large **search / command bar**, and the trust line "Free. Private. Runs in your browser."
- **Bento-style grid** of tool cards grouped by category, with hover lift, icon animation and "Popular" or "New" badges
- "Recently used" tools row (stored in `localStorage`, wrapped in try/catch)
- Short "Why it's private" explainer with a simple diagram (file stays on device, nothing uploaded)
- Footer with category links for SEO and navigation

### 5A.5 Tool page experience
- **Large animated dropzone:** dashed border that glows and scales slightly on drag-over, with the whole page accepting drops as a fallback
- Three ways to add files: drag and drop, click to browse, and **paste from clipboard** (Ctrl/Cmd + V) for images
- **File cards** with thumbnail (image preview or first PDF page), name, size, page count and a remove button; smooth add and remove animations
- **Drag-to-reorder** with a lifted card, placeholder gap and smooth settling (Merge PDF, Image → PDF)
- **Stepper cue:** Upload → Options → Convert → Download, with the active step highlighted
- **Live previews** where possible: page-size preview for Image → PDF, quality preview for compressors, table preview for CSV/Excel
- **Before / after comparison slider** for the image compressor, plus the "saved 62%" stat
- Sticky **action bar** (Convert / Download) pinned to the bottom on mobile, within thumb reach
- Progress states: determinate progress bar when known, shimmer or skeleton when not, with plain-language status ("Rendering page 3 of 12…")
- **Success state:** animated checkmark, file size, large Download button, "Convert another" and suggestions for related tools
- **Empty, loading and error states** all designed (friendly illustration or icon, one-line explanation, one clear next step)

### 5A.6 Micro-interactions
- Button press (scale 0.98), hover lift, focus ring with brand colour
- Dropzone icon bounce when a file hovers over it
- Animated counters for file size savings
- Toast notifications that slide in, auto-dismiss, and are pausable on hover
- Tooltips on option controls, using accessible `aria-describedby`
- Smooth accordion for FAQs
- Optional subtle confetti or ring pulse on successful conversion (tiny, skippable, off for reduced motion)

### 5A.7 Navigation and power-user features
- **Command palette** (Ctrl/Cmd + K) to jump to any tool by name
- Search with instant filtering on the home page and a "related tools" strip on every tool page
- Keyboard shortcuts: Enter to convert, Esc to cancel or clear, Ctrl/Cmd + V to paste
- Breadcrumbs on tool pages, and a mega-menu or clean dropdown grouped by category
- Smooth page transitions (View Transitions API where supported, with a plain fallback)

### 5A.8 Mobile experience
- Mobile-first layouts with large touch targets (at least 44 x 44 px)
- Bottom sheet for options instead of long forms; collapsible sections
- Native file picker with camera option for images (`accept="image/*"` with `capture` where useful)
- Sticky bottom action bar and safe-area padding on notched phones
- Tested on low-end Android devices, since many Indian users are on mid-range phones and slower networks

### 5A.9 PWA and offline (bonus, fits the privacy story)
- Web app manifest and service worker so the site is installable and works **offline** after first load
- Cache the self-hosted libraries so tools run without internet
- "Install app" prompt shown tastefully, never as a pop-up on first visit

### 5A.10 Microcopy and tone
- Short, friendly, specific wording ("Drop your PDFs here" instead of "Upload file")
- Error messages explain the problem and the fix ("This PDF is password protected. Remove the password and try again.")
- Reassurance text next to the dropzone: "Files never leave your device"
- Optional multi-language support later (Hindi and other Indian languages) using a small JSON-based i18n layer

### 5A.11 Accessibility as part of premium
- `prefers-reduced-motion` support that disables non-essential animation
- `prefers-color-scheme` default and `prefers-contrast` support
- Focus management after conversion (move focus to the result), `aria-live` status announcements
- Fully keyboard-operable drag-and-drop alternatives (move up and down buttons for reordering)

### 5A.12 Performance budget for a premium feel
- Largest Contentful Paint under 2 s on a mid-range phone over 4G
- Total CSS under 50 KB and shared JS under 40 KB (gzipped), excluding lazy-loaded libraries
- Fonts: subset, `font-display: swap`, preload the primary weight
- Images as WebP or SVG, with explicit width and height to prevent layout shift
- Cumulative Layout Shift under 0.1

### 5A.13 Design workflow and deliverables
1. Collect 5 to 8 reference sites (e.g. iLovePDF, Smallpdf, Squoosh, Linear, Vercel) and note what feels premium about each
2. Sketch or wireframe the home page and one tool page (paper or Figma)
3. Define tokens and build a small **component library page** (`/styleguide.html`) showing buttons, dropzone, file cards, toasts and form controls in both themes
4. Build the first tool completely (Merge PDF) as the reference implementation, then reuse it for the others
5. Run a usability check with 3 to 5 real users (friends, classmates) and fix friction points before adding more tools
6. Final polish pass: spacing audit, animation timing, dark mode review, empty and error states

### 5A.14 Timeline impact
Add roughly **one extra week** to the schedule: design tokens and the style guide in week 1, polish pass in week 5, and PWA/offline in week 6 or after launch.

### 5A.15 Premium UI/UX checklist
- [ ] Design tokens defined for both themes
- [ ] Style guide page built and reviewed
- [ ] Animated dropzone, file cards, progress and success states done
- [ ] Drag-to-reorder smooth on desktop and touch
- [ ] Command palette and search working
- [ ] Mobile sticky action bar and bottom sheet tested on real devices
- [ ] Reduced-motion and keyboard paths verified
- [ ] Empty, loading and error states designed for every tool
- [ ] Performance budget met (Lighthouse check)
- [ ] Logo, favicon set and social preview image finished

---

## 6. Architecture Notes

### Shared module (`common.js`)
- `setupDropzone(element, { accept, multiple, maxSizeMB, onFiles })`
- `validateFile(file, rules)`: type, size, empty-file check
- `readAsArrayBuffer(file)` / `readAsDataURL(file)` / `readAsText(file)`
- `downloadBlob(blob, filename)`: creates an object URL and revokes it afterwards
- `formatBytes(n)`
- `showToast(message, type)`
- `setBusy(button, isBusy)`

### Per-tool script pattern
```js
import { setupDropzone, downloadBlob, showToast } from '../common.js';

let files = [];
setupDropzone(dropzoneEl, { accept: ['application/pdf'], multiple: true, onFiles: addFiles });
convertBtn.addEventListener('click', async () => {
  try {
    setBusy(convertBtn, true);
    const blob = await convert(files);
    downloadBlob(blob, 'merged.pdf');
  } catch (err) {
    showToast('Something went wrong. The file may be corrupted or protected.', 'error');
    console.error(err);
  } finally {
    setBusy(convertBtn, false);
  }
});
```

### Performance
- Run heavy work (large PDF rendering, big CSV parsing) in **Web Workers** where practical so the UI never freezes
- Process pages sequentially for PDF → image to limit memory use
- Revoke object URLs with `URL.revokeObjectURL`
- Lazy-load libraries only on the page that needs them
- Set a reasonable file size limit (for example 50 to 100 MB) and warn the user above it

### Data-handling rule
No analytics call, API request or `fetch` may include file data. Everything stays local. Document this in `privacy.html`.

---

## 7. Detailed Specification Per Tool

### 7.1 Image → PDF
- **Input:** JPG, PNG, WebP (multiple)
- **Options:** page size (A4, Letter, Fit to image), orientation, margin, image order (drag to reorder)
- **Process:** load each image, scale to fit the page, add one page per image
- **Output:** `images.pdf`
- **Edge cases:** very large images (downscale), transparent PNGs (white background), EXIF rotation, HEIC (suggest the HEIC converter)

### 7.2 Merge PDF
- **Input:** 2+ PDFs
- **Options:** reorder via drag and drop, remove files
- **Process:** `PDFDocument.create()`, `copyPages` from each source, `save()`
- **Edge cases:** password-protected PDFs (show a clear error), corrupted files, very large merged output

### 7.3 Split PDF
- **Modes:** extract page range (e.g. `1-3, 5, 8-10`), split every N pages, split each page into a separate file
- **Output:** a single PDF or a ZIP (via JSZip) for multiple files
- **Edge cases:** invalid or out-of-range input, empty range

### 7.4 PDF → Images
- **Process:** pdf.js `getPage` → `render` to canvas → `toBlob('image/png' | 'image/jpeg')`
- **Options:** format, scale/DPI (1x, 2x, 3x), page range
- **Output:** single image or ZIP of all pages
- **Notes:** set the pdf.js worker source correctly; free canvas memory between pages

### 7.5 Image Converter
- **Formats:** PNG, JPG, WebP (output). Check browser support for AVIF output before offering it
- **Options:** quality slider for JPG/WebP, background colour when converting transparency to JPG
- **Process:** draw onto canvas, `canvas.toBlob(type, quality)`
- **Batch:** multiple files into a ZIP

### 7.6 Image Compressor / Resizer
- **Options:** quality, max width/height, keep aspect ratio, target size (optional)
- **Display:** before and after size, percentage saved, side-by-side preview
- **Notes:** stripping EXIF is a side effect of canvas re-encoding; mention it

### 7.7 CSV ↔ JSON
- **Options:** delimiter (auto-detect), header row yes/no, pretty-print JSON
- **Process:** PapaParse for both directions
- **Edge cases:** quoted fields, embedded newlines, BOM, large files, nested JSON (flatten with a clear warning)
- **Extras:** preview table of the first 20 rows, copy-to-clipboard

### 7.8 Excel ↔ CSV / JSON
- **Input:** .xlsx, .xls, .csv
- **Options:** choose the sheet, output format
- **Process:** SheetJS `read` → `sheet_to_csv` / `sheet_to_json`; reverse with `json_to_sheet` and `writeFile`
- **Edge cases:** multiple sheets (offer a ZIP or a sheet picker), dates, formulas (values only), merged cells

### 7.9 Word (.docx) → HTML / Text
- **Process:** mammoth `convertToHtml` / `extractRawText`
- **Output:** HTML preview, copy and download buttons
- **Notice:** "Complex layouts, text boxes and some styles are simplified"
- **Security:** sanitize or isolate the HTML preview (use a sandboxed iframe) since the content comes from the user's file

### 7.10 Markdown → HTML / PDF
- **Live editor:** left pane Markdown, right pane preview
- **Process:** `marked` for HTML; PDF through `window.print()` with a print stylesheet or html2pdf.js
- **Security:** sanitize the rendered HTML (DOMPurify) before inserting it

### 7.11 PDF → Text
- **Process:** pdf.js `getTextContent` per page, join items
- **Notice:** works only for text-based PDFs; scanned PDFs return nothing (suggest OCR when added)

### 7.12 Extended tools (rotate, reorder, delete pages, HEIC, HTML → Markdown, watermark)
Follow the same shared pattern: dropzone → options → convert → download. Write a short spec for each (inputs, options, edge cases) before building it.

---

## 8. SEO Plan

- Unique `<title>` (under 60 characters) and `<meta name="description">` (under 160 characters) per page
- Target keyword in the H1 and the first paragraph (e.g. "Merge PDF files online, free")
- Short "How to" and FAQ sections on every tool page (200 to 400 words of real content)
- FAQ structured data (`FAQPage` JSON-LD) and `SoftwareApplication` schema where suitable
- Open Graph and Twitter card tags with a preview image
- Canonical URL on every page
- `sitemap.xml` and `robots.txt`; submit to Google Search Console and Bing Webmaster Tools
- Descriptive internal links ("Need to split instead? Try Split PDF") between related tools
- Fast load: small CSS/JS, lazy-loaded libraries, compressed images (WebP)
- Semantic HTML (`header`, `main`, `section`, `footer`)

---

## 9. Security and Privacy

- No file data ever sent to a server (verify in the browser Network tab)
- Pin library versions and add SRI hashes to CDN script tags (or self-host)
- Sanitize any HTML produced from user files before rendering (DOMPurify, or a sandboxed iframe)
- Validate file type by MIME type **and** extension; check size before reading
- Set a Content Security Policy via `<meta http-equiv="Content-Security-Policy">` (GitHub Pages cannot set headers)
- Never use `eval` or `innerHTML` with untrusted strings
- Privacy page that states plainly what is and isn't collected
- If analytics or ads are added later, use privacy-friendly analytics (e.g. Plausible, Umami, or GoatCounter) and update the privacy page. Never send file names or contents

---

## 10. Testing Plan

### Functional tests (manual checklist per tool)
- Happy path with a typical file
- Multiple files, single file, zero files
- Wrong file type, empty file, corrupted file
- Password-protected PDF
- Very large file (50 MB+) and very many pages (200+)
- File names with spaces, Unicode, Hindi/Telugu or other Indian-language names
- Cancel and "convert another" reset

### Cross-browser and device
- Chrome, Firefox, Safari (desktop and iOS), Edge, Chrome on Android
- Small phones (360px width), tablets, large desktops
- Safari quirks: canvas size limits, download behaviour, Blob handling

### Quality checks
- Lighthouse: aim for 90+ in Performance, Accessibility, Best Practices and SEO
- HTML validation (W3C validator)
- Link checker for broken links
- Keyboard-only navigation and screen reader spot check
- Output verification: open resulting PDFs and spreadsheets in other apps to confirm they are valid

### Optional automation
- Playwright or Cypress smoke tests (page loads, upload sample file, download produced)
- GitHub Actions workflow running HTML validation and link checks on every push

---

## 11. Deployment on GitHub Pages

1. Create a public repo (e.g. `username.github.io` for a root site, or any repo name for a project site at `username.github.io/repo-name/`).
2. Push the project to the `main` branch.
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Wait for the first build, then open the published URL.
5. **Project-site path caution:** if the site lives at `/repo-name/`, use **relative paths** (`../assets/css/base.css`) or a consistent base path, otherwise CSS and scripts break.
6. Add a `404.html` for broken URLs.
7. **Custom domain (optional):** buy a domain, add a `CNAME` file containing the domain, set the DNS records (A records to GitHub's IPs or a CNAME to `username.github.io`), then enable **Enforce HTTPS**.
8. Add a `.nojekyll` file in the root if any folder names start with an underscore or Jekyll causes problems.

### Release workflow
- Work on feature branches, merge to `main` through pull requests
- Tag releases (`v1.0.0`, `v1.1.0`) and keep a `CHANGELOG.md`
- Every merge to `main` redeploys automatically

---

## 12. Timeline (Suggested, Solo Developer)

| Week | Focus | Deliverables |
|---|---|---|
| 1 | Setup and design | Repo, folder structure, base CSS, header/footer, home page, `common.js`, dropzone component, dark mode |
| 2 | PDF core | Image → PDF, Merge PDF, Split PDF |
| 3 | Rendering and images | PDF → Images, Image converter, Image compressor |
| 4 | Data tools | CSV ↔ JSON, Excel ↔ CSV/JSON |
| 5 | Polish and SEO | Static pages (About, Privacy, Terms, Contact), meta tags, sitemap, FAQ content, 404 page |
| 6 | Testing and launch | Cross-browser testing, Lighthouse fixes, deploy, Search Console submission |
| 7+ | Phase 2 | docx → HTML, Markdown tools, PDF → Text, rotate/reorder pages, HEIC |

Adjust the pace to your availability; each simple tool typically takes a few hours once the shared components exist.

---

## 13. Launch Checklist

- [ ] All Phase 1 tools tested on desktop and mobile
- [ ] Error messages are clear and friendly
- [ ] Each page has a unique title, description, H1, canonical link
- [ ] Sitemap and robots.txt in place and reachable
- [ ] Privacy, Terms, About, Contact pages written
- [ ] Favicon and social preview image added
- [ ] Library versions pinned (SRI hashes added or libraries self-hosted)
- [ ] CSP meta tag tested (nothing blocked unexpectedly)
- [ ] Lighthouse scores acceptable
- [ ] 404 page works
- [ ] HTTPS enforced
- [ ] Submitted to Google Search Console and Bing Webmaster Tools
- [ ] README explains the project, tools and how to run it locally

---

## 14. Post-Launch and Growth

- Watch Search Console for queries and fix pages that rank poorly
- Add new tools based on what people search for (compress PDF, JPG to PDF, PDF to JPG, and similar)
- Collect feedback via a GitHub Issues link or a simple contact form (e.g. Formspree), keeping the privacy page accurate
- Share on Reddit (r/webdev, r/SideProject), Product Hunt, Hacker News (Show HN), Indian developer communities
- Consider monetisation only once traffic exists: non-intrusive ads or a donation/"Buy me a coffee" link. Update the privacy page accordingly
- Re-check library versions every few months and test before upgrading
- If demand appears for PDF ↔ Word, add a small backend (Laravel/Node + LibreOffice headless) as a separate service, while keeping the client-side tools free and private

---

## 15. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Large files crash the browser tab | Bad UX | Size limits, Web Workers, sequential processing, clear warnings |
| CDN outage or a malicious library update | Site breaks or is unsafe | Pinned versions, SRI hashes, optional self-hosting |
| Users expect perfect PDF → Word | Disappointment | Do not offer it in v1, or label it "text only" |
| Safari/iOS quirks | Broken downloads or canvas limits | Test early on real devices; fall back to opening the file in a new tab |
| Low search traffic | Few users | Unique content per page, FAQs, internal links, outreach |
| Copyright/licence issues in libraries | Legal risk | Review each library's license and list them in `THIRD_PARTY_LICENSES.md` |
| Rendering untrusted HTML (docx, Markdown) | XSS | DOMPurify and sandboxed iframes |

---

## 16. Tools Needed

- Code editor (VS Code) with Live Server extension for local testing
- Git and a GitHub account
- Browser dev tools for debugging and the Network tab check
- Lighthouse (built into Chrome)
- Sample test files: small and large PDFs, scanned PDF, password-protected PDF, images of various formats, CSV/XLSX with Unicode data
- Figma or plain paper sketches for layout (optional)

---

## 17. Definition of Done (v1.0)

The first version is done when:
1. The eight Phase 1 tools work correctly on current Chrome, Firefox, Safari and Edge, on desktop and mobile.
2. No file data leaves the browser (verified in the Network tab).
3. Every tool page has SEO metadata, instructions and an FAQ.
4. The site is live on GitHub Pages over HTTPS.
5. The launch checklist in section 13 is fully ticked.