/* ============================================================
   ConvertKit — markdown-to-html.js
   Live Markdown editor with sanitised HTML preview
   ============================================================ */
import {
  downloadBlob,
  showToast,
  setStatus,
  debounce,
  escapeHtml,
  copyText,
  ICONS,
} from "../common.js";

const input = document.getElementById("markdown-input");
const preview = document.getElementById("preview-frame");
const output = document.getElementById("output");
const statusEl = document.getElementById("status");
const tabs = document.getElementById("output-tabs");
const wordCount = document.getElementById("word-count");

const SAMPLE = `# ConvertKit Markdown editor

Write **Markdown** on the left and see the HTML update instantly.

## Features

- Live preview
- Copy or download the HTML
- Nothing leaves your browser

> Tip: use the preview tab to check formatting.

\`\`\`js
const greeting = "hello, world";
console.log(greeting);
\`\`\`

Learn more at the [Markdown guide](https://commonmark.org/).
`;

marked.setOptions({ gfm: true, breaks: false });

let html = "";

function docShell(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    :root{color-scheme:light}
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.65;color:#0f172a;margin:0;padding:16px;background:#fff}
    img{max-width:100%;height:auto}
    pre{background:#f1f5f9;padding:12px;border-radius:8px;overflow:auto}
    code{font-family:ui-monospace,Menlo,monospace;font-size:.9em}
    blockquote{border-left:3px solid #c7d2fe;margin:0;padding-left:12px;color:#475569}
    table{border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:6px 8px}
    a{color:#4f46e5}h1,h2,h3{margin:.7em 0 .3em}
  </style></head><body>${content}</body></html>`;
}

function render() {
  const source = input.value;
  let raw;
  try {
    raw = marked.parse(source);
  } catch (error) {
    console.error(error);
    setStatus(statusEl, "There is a problem with the Markdown. Check for unclosed code blocks.", "error");
    return;
  }
  html = window.DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  preview.srcdoc = docShell(html);
  output.textContent = html;
  const words = source.trim() ? source.trim().split(/\s+/).length : 0;
  wordCount.textContent = `${words} word${words === 1 ? "" : "s"} · ${source.length} characters`;
}

input.addEventListener("input", debounce(render, 150));

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-view]");
  if (!tab) return;
  tabs.querySelectorAll("[data-view]").forEach((el) => {
    const active = el === tab;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-selected", String(active));
  });
  const showPreview = tab.dataset.view === "preview";
  preview.hidden = !showPreview;
  output.hidden = showPreview;
});

document.getElementById("copy-btn").addEventListener("click", () => copyText(html));

document.getElementById("download-btn").addEventListener("click", () => {
  downloadBlob(new Blob([docShell(html)], { type: "text/html;charset=utf-8" }), "markdown.html");
});

document.getElementById("clear-btn").addEventListener("click", () => {
  input.value = "";
  render();
  input.focus();
});

document.getElementById("sample-btn").addEventListener("click", () => {
  input.value = SAMPLE;
  render();
});

input.value = SAMPLE;
render();
