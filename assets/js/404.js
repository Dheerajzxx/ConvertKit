import { TOOLS, ICONS, getRoot, escapeHtml } from "./common.js";

const root = getRoot();
const picks = ["merge-pdf", "image-compressor", "excel-to-csv"];
const host = document.getElementById("quick-links");

if (host) {
  host.innerHTML = picks
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean)
    .map(
      (t) => `<a class="related-card cat-${t.category}" href="${root}${t.path}">
        <span class="related-card__icon" aria-hidden="true">${ICONS[t.icon]}</span>
        <span><span class="related-card__name">${escapeHtml(t.name)}</span>
        <span class="related-card__desc">${escapeHtml(t.desc)}</span></span>
      </a>`
    )
    .join("");
}
