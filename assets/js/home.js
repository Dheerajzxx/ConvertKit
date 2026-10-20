/* ============================================================
   ConvertKit — home.js
   Renders the tool grid, search filtering and recently used row.
   ============================================================ */
import {
  TOOLS,
  CATEGORIES,
  ICONS,
  getRoot,
  getTool,
  getRecent,
  escapeHtml,
  debounce,
} from "./common.js";

const root = getRoot();
const toolsRoot = document.getElementById("tools-root");
const recentRoot = document.getElementById("recent-tools");
const recentSection = document.getElementById("recent-section");
const searchInput = document.getElementById("tool-search");
const emptyState = document.getElementById("search-empty");

function card(tool) {
  const badge = tool.badge
    ? `<span class="tool-card__badge badge-${tool.badge.toLowerCase()}">${tool.badge}</span>`
    : "";
  return `
    <a class="tool-card cat-${tool.category}" href="${root}${tool.path}" data-search="${escapeHtml(
      `${tool.name} ${tool.desc} ${tool.keywords}`.toLowerCase()
    )}">
      <span class="tool-card__top">
        <span class="tool-card__icon" aria-hidden="true">${ICONS[tool.icon] || ICONS.file}</span>
        ${badge}
      </span>
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.desc)}</p>
      <span class="tool-card__go">Open tool ${ICONS.arrowRight}</span>
    </a>`;
}

function renderAll() {
  if (!toolsRoot) return;
  toolsRoot.innerHTML = Object.entries(CATEGORIES)
    .map(([key, cat]) => {
      const tools = TOOLS.filter((t) => t.category === key);
      if (!tools.length) return "";
      return `
        <section class="tool-section" data-section="${key}" id="${cat.id}" aria-labelledby="${cat.id}-title">
          <div class="tool-section__head">
            <h2 id="${cat.id}-title"><span class="cat-dot cat-${key}" aria-hidden="true"></span>${cat.name}</h2>
            <span class="count">${tools.length} ${tools.length === 1 ? "tool" : "tools"}</span>
          </div>
          <div class="tool-grid">${tools.map(card).join("")}</div>
        </section>`;
    })
    .join("");
}

function renderRecent() {
  if (!recentRoot || !recentSection) return;
  const ids = getRecent();
  if (!ids.length) {
    recentSection.hidden = true;
    return;
  }
  recentSection.hidden = false;
  recentRoot.innerHTML = ids
    .map((id) => {
      const tool = getTool(id);
      if (!tool) return "";
      return `<a class="recent-chip cat-${tool.category}" href="${root}${tool.path}">
        <span class="cat-dot cat-${tool.category}" aria-hidden="true"></span>${escapeHtml(tool.name)}
      </a>`;
    })
    .join("");
}

function filterTools() {
  if (!toolsRoot) return;
  const q = (searchInput?.value || "").trim().toLowerCase();
  let visible = 0;

  toolsRoot.querySelectorAll("[data-section]").forEach((section) => {
    let sectionVisible = 0;
    section.querySelectorAll(".tool-card").forEach((cardEl) => {
      const match = !q || cardEl.dataset.search.includes(q);
      cardEl.hidden = !match;
      if (match) sectionVisible += 1;
    });
    section.hidden = sectionVisible === 0;
    visible += sectionVisible;
  });

  if (emptyState) emptyState.hidden = visible !== 0;
}

renderAll();
renderRecent();
if (searchInput) {
  searchInput.addEventListener("input", debounce(filterTools, 80));
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      filterTools();
    }
    if (event.key === "Enter") {
      const first = toolsRoot?.querySelector(".tool-card:not([hidden])");
      if (first) first.click();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    document.activeElement !== searchInput &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
  ) {
    event.preventDefault();
    searchInput?.focus();
  }
});
