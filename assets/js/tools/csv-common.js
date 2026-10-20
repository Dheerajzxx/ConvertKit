/* ============================================================
   ConvertKit — csv-common.js
   Shared parsing helpers for the CSV / JSON / Excel tools
   ============================================================ */
import { escapeHtml } from "../common.js";

export const MAX_PREVIEW_ROWS = 20;

export function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: (h) => h.trim().replace(/^\ufeff/, ""),
  });
  return result;
}

export function previewTable(container, rows, columns, limit = MAX_PREVIEW_ROWS) {
  if (!container) return;
  const cols = columns && columns.length ? columns : Object.keys(rows[0] || {});
  if (!cols.length) {
    container.innerHTML = '<p class="empty-state">Nothing to preview.</p>';
    return;
  }
  const head = cols.map((c) => `<th scope="col">${escapeHtml(String(c))}</th>`).join("");
  const body = rows
    .slice(0, limit)
    .map(
      (row) =>
        `<tr>${cols
          .map((c) => {
            const value = row[c];
            return `<td title="${escapeHtml(value == null ? "" : String(value))}">${escapeHtml(
              value == null ? "" : String(value)
            )}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");
  container.innerHTML = `<div class="table-wrap"><table class="data-table"><caption class="visually-hidden">Data preview</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function flattenObject(value, prefix = "", out = {}, note = { nested: false }) {
  if (Array.isArray(value)) {
    note.nested = true;
    out[prefix || "value"] = JSON.stringify(value);
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === "object") {
        note.nested = true;
        flattenObject(child, next, out, note);
      } else {
        out[next] = child;
      }
    });
    return out;
  }
  out[prefix || "value"] = value;
  return out;
}
