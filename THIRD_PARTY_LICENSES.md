# Third-party licences

ConvertKit bundles the following open-source libraries with the site under `assets/vendor/`.
Versions are pinned and the files are self-hosted, so the tools keep working without a CDN.

| Library | Version | Used by | Licence | Homepage |
|---|---|---|---|---|
| pdf-lib | 1.17.1 | Merge PDF, Split PDF, Image → PDF, Rotate PDF | MIT | https://pdf-lib.js.org/ |
| PDF.js (pdfjs-dist) | 3.11.174 | PDF → Image, PDF → Text | Apache-2.0 | https://mozilla.github.io/pdf.js/ |
| SheetJS Community Edition (xlsx) | 0.18.5 | Excel → CSV/JSON | Apache-2.0 | https://sheetjs.com/ |
| PapaParse | 5.4.1 | CSV → JSON, JSON → CSV, Excel → CSV | MIT | https://www.papaparse.com/ |
| JSZip | 3.10.1 | Split PDF, PDF → Image, Image Converter | MIT / GPL-3.0 (dual) | https://stuk.github.io/jszip/ |
| Mammoth.js | 1.8.0 | Word → HTML | BSD-2-Clause | https://github.com/mwilliamson/mammoth.js |
| marked | 12.0.2 | Markdown → HTML | MIT | https://marked.js.org/ |
| DOMPurify | 3.1.7 | Word → HTML, Markdown → HTML (sanitising) | Apache-2.0 OR MPL-2.0 | https://github.com/cure53/DOMPurify |

## Notes

- **PDF.js** is licensed under Apache-2.0. The bundled `pdf.worker.min.js` must remain alongside
  `pdf.min.js`; the tools point the worker at the local copy.
- **JSZip** is offered under either the MIT licence or GPL-3.0. ConvertKit relies on the MIT
  option, which is compatible with this site.
- **DOMPurify** is dual-licensed; ConvertKit uses it under Apache-2.0.

Full licence texts ship with each upstream project. If you redistribute ConvertKit, keep this
file in place and preserve any copyright notices contained in the vendor files.
