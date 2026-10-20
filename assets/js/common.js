/* ============================================================
   ConvertKit — common.js
   Shared UI helpers, tool registry, dropzone, downloads, toasts
   ============================================================ */

/* ---------- Icons ---------- */
const svg = (inner, cls = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${inner}</svg>`;

export const ICONS = {
  upload: svg('<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/>'),
  download: svg('<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M20 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/>'),
  file: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>'),
  pdf: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6"/><path d="M14 18v-6h1a3 3 0 0 1 0 6z"/>'),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5a1.4 1.4 0 0 0-2 0L5 20"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M3 14h18"/><path d="M9 9v11"/><path d="M15 9v11"/>'),
  document: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>'),
  merge: svg('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M12 8v8"/><path d="m9 13 3 3 3-3"/>'),
  split: svg('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="m8 7.5 12 9"/><path d="M8 16.5 20 7.5"/>'),
  layers: svg('<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>'),
  rotate: svg('<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'),
  text: svg('<path d="M4 6V4h16v2"/><path d="M12 4v16"/><path d="M9 20h6"/>'),
  check: svg('<path d="m5 12 5 5L20 6"/>'),
  x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
  menu: svg('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>'),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  github: svg('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  grip: svg('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
  up: svg('<path d="m18 15-6-6-6 6"/>'),
  down: svg('<path d="m6 9 6 6 6-6"/>'),
  left: svg('<path d="m15 18-6-6 6-6"/>'),
  right: svg('<path d="m9 18 6-6-6-6"/>'),
  arrowRight: svg('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  code: svg('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
  printer: svg('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
  shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
  zap: svg('<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/>'),
  sparkles: svg('<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15v4"/><path d="M17 17h4"/>'),
  alert: svg('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>'),
  refresh: svg('<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/>'),
  eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  chevronDown: svg('<path d="m6 9 6 6 6-6"/>'),
  external: svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'),
  header: svg('<path d="M4 4h16"/><path d="M4 20h16"/><path d="M7 15V9"/><path d="M17 15V9"/><path d="M7 12h10"/>'),
  watermark: svg('<path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><rect x="2" y="14" width="20" height="7" rx="2"/>'),
};

/* ---------- Tool registry ---------- */
export const CATEGORIES = {
  pdf: { name: "PDF tools", short: "PDF", icon: "pdf", id: "pdf-tools" },
  image: { name: "Image tools", short: "Image", icon: "image", id: "image-tools" },
  data: { name: "Data tools", short: "Data", icon: "table", id: "data-tools" },
  document: { name: "Document tools", short: "Document", icon: "document", id: "document-tools" },
};

export const TOOLS = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    title: "Merge PDF files online, free",
    desc: "Combine multiple PDFs into one document in the order you choose.",
    icon: "merge",
    category: "pdf",
    path: "tools/merge-pdf.html",
    badge: "Popular",
    keywords: "combine join pdf",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    title: "Split PDF files online, free",
    desc: "Extract pages or split a PDF into several files by range.",
    icon: "split",
    category: "pdf",
    path: "tools/split-pdf.html",
    keywords: "extract pages separate",
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    title: "Convert images to PDF online, free",
    desc: "Turn JPG, PNG and WebP images into a single tidy PDF.",
    icon: "image",
    category: "pdf",
    path: "tools/image-to-pdf.html",
    badge: "Popular",
    keywords: "jpg png webp photo",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    title: "Convert PDF pages to JPG or PNG",
    desc: "Export every PDF page as a high-quality image. Download individually or as a ZIP.",
    icon: "image",
    category: "pdf",
    path: "tools/pdf-to-image.html",
    keywords: "jpg png render",
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    title: "Rotate PDF pages online, free",
    desc: "Rotate selected pages or the whole PDF and save the result.",
    icon: "rotate",
    category: "pdf",
    path: "tools/rotate-pdf.html",
    keywords: "turn orientation landscape",
  },
  {
    id: "pdf-to-text",
    name: "PDF to Text",
    title: "Extract text from PDF files",
    desc: "Copy or download the text from a text-based PDF.",
    icon: "text",
    category: "pdf",
    path: "tools/pdf-to-text.html",
    keywords: "extract copy txt",
  },
  {
    id: "image-converter",
    name: "Image Converter",
    title: "Convert PNG, JPG and WebP images",
    desc: "Switch between PNG, JPG and WebP with a quality slider and batch ZIP download.",
    icon: "image",
    category: "image",
    path: "tools/image-converter.html",
    keywords: "png jpg webp convert",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    title: "Compress and resize images online",
    desc: "Shrink image file size with a quality and dimension control. See the savings.",
    icon: "zap",
    category: "image",
    path: "tools/image-compressor.html",
    badge: "Popular",
    keywords: "resize reduce optimize",
  },
  {
    id: "csv-to-json",
    name: "CSV to JSON",
    title: "Convert CSV to JSON online, free",
    desc: "Turn spreadsheet CSV data into clean, pretty-printed JSON.",
    icon: "table",
    category: "data",
    path: "tools/csv-to-json.html",
    keywords: "delimiter parse spreadsheet",
  },
  {
    id: "json-to-csv",
    name: "JSON to CSV",
    title: "Convert JSON to CSV online, free",
    desc: "Flatten JSON arrays into a spreadsheet-ready CSV file.",
    icon: "table",
    category: "data",
    path: "tools/json-to-csv.html",
    keywords: "parse flatten spreadsheet",
  },
  {
    id: "excel-to-csv",
    name: "Excel to CSV",
    title: "Convert Excel to CSV or JSON",
    desc: "Read .xlsx, .xls or .csv files and export any sheet as CSV or JSON.",
    icon: "table",
    category: "data",
    path: "tools/excel-to-csv.html",
    keywords: "xlsx xls sheet spreadsheet",
  },
  {
    id: "docx-to-html",
    name: "Word to HTML",
    title: "Convert Word documents to HTML",
    desc: "Turn .docx files into clean HTML or plain text, ready to copy.",
    icon: "document",
    category: "document",
    path: "tools/docx-to-html.html",
    keywords: "docx word convert",
  },
  {
    id: "markdown-to-html",
    name: "Markdown to HTML",
    title: "Markdown to HTML converter",
    desc: "Write Markdown with a live preview, then copy or download the HTML.",
    icon: "code",
    category: "document",
    path: "tools/markdown-to-html.html",
    keywords: "md preview editor",
  },
];

/* ---------- Small utilities ---------- */
export function getRoot() {
  const explicit = document.body && document.body.dataset.root;
  if (explicit !== undefined && explicit !== null) return explicit;
  return location.pathname.includes("/tools/") ? "../" : "";
}

export function getTool(id) {
  return TOOLS.find((t) => t.id === id);
}

export function toolUrl(tool, root = getRoot()) {
  return root + (typeof tool === "string" ? getTool(tool).path : tool.path);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatBytes(bytes, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const dp = i === 0 ? 0 : value >= 100 ? 0 : decimals;
  return `${value.toFixed(dp)} ${units[i]}`;
}

export function debounce(fn, wait = 160) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function sanitizeFilename(name, fallback = "download") {
  const base = String(name || "")
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 120);
  return base || fallback;
}

/* ---------- File helpers ---------- */
export function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be loaded."));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))),
      type,
      quality
    );
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeFilename(filename, "convertkit-download");
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text, filename, type = "text/plain;charset=utf-8") {
  downloadBlob(new Blob([text], { type }), filename);
}

/* ---------- Validation ---------- */
function extensionOf(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function mimeMatches(mime, rule) {
  if (!mime || !rule || !rule.includes("/")) return false;
  if (rule === mime) return true;
  if (rule.endsWith("/*")) return mime.startsWith(rule.slice(0, -1));
  return false;
}

export function validateFile(file, { accept = [], maxSizeMB = 100 } = {}) {
  if (!file) return { ok: false, message: "No file selected." };

  if (!file.size) {
    return { ok: false, message: `"${file.name}" is empty.` };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `"${file.name}" is ${formatBytes(file.size)}. The limit is ${maxSizeMB} MB.`,
    };
  }

  if (accept && accept.length) {
    const ext = extensionOf(file.name);
    const mime = (file.type || "").toLowerCase();
    const extRules = accept.filter((r) => r.startsWith("."));
    const mimeRules = accept.filter((r) => r.includes("/"));
    const extOk = extRules.length === 0 || extRules.includes(ext);
    const mimeOk = mimeRules.length === 0 || mimeRules.some((r) => mimeMatches(mime, r));

    if (!(extOk && mimeOk)) {
      const readable = accept
        .map((r) => r.replace("application/", "").replace("image/", "").replace(".", ""))
        .join(", ");
      return {
        ok: false,
        message: `"${file.name}" is not a supported file. Allowed: ${readable}.`,
      };
    }
  }

  return { ok: true };
}

/* ---------- Toast ---------- */
let toastRegion;

function ensureToastRegion() {
  if (!toastRegion) {
    toastRegion = document.createElement("div");
    toastRegion.className = "toast-region";
    toastRegion.setAttribute("role", "region");
    toastRegion.setAttribute("aria-label", "Notifications");
    toastRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(toastRegion);
  }
  return toastRegion;
}

const TOAST_ICONS = {
  success: "check",
  error: "alert",
  warning: "alert",
  info: "info",
};

export function showToast(message, type = "info", duration = 5000) {
  const region = ensureToastRegion();
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${ICONS[TOAST_ICONS[type] || "info"]}</span>
    <div class="toast__body"><p class="toast__message"></p></div>
    <button class="toast__close" type="button" aria-label="Dismiss notification">${ICONS.x}</button>
  `;
  el.querySelector(".toast__message").textContent = message;
  region.appendChild(el);

  let timer;
  let remaining = duration;
  let started = Date.now();

  const dismiss = () => {
    clearTimeout(timer);
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };

  const start = () => {
    started = Date.now();
    timer = setTimeout(dismiss, remaining);
  };

  el.querySelector(".toast__close").addEventListener("click", dismiss);
  el.addEventListener("mouseenter", () => {
    clearTimeout(timer);
    remaining -= Date.now() - started;
  });
  el.addEventListener("mouseleave", start);

  start();
  return el;
}

/* ---------- Busy state ---------- */
const busyLabels = new WeakMap();

export function setBusy(button, isBusy, label = "Working…") {
  if (!button) return;
  if (isBusy) {
    if (!busyLabels.has(button)) busyLabels.set(button, button.innerHTML);
    button.classList.add("is-busy");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`;
  } else {
    button.classList.remove("is-busy");
    button.disabled = false;
    button.removeAttribute("aria-busy");
    if (busyLabels.has(button)) {
      button.innerHTML = busyLabels.get(button);
      busyLabels.delete(button);
    }
  }
}

export function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message || "";
  el.dataset.type = type || "";
  el.setAttribute("role", "status");
}

/* ---------- Mirrored action buttons (mobile sticky bar) ---------- */
export function mirrorButton(primary, mirror) {
  if (!primary || !mirror) return;
  const sync = () => {
    mirror.disabled = primary.disabled;
    mirror.className = primary.className;
    mirror.innerHTML = primary.innerHTML;
  };
  mirror.addEventListener("click", () => {
    if (!primary.disabled) primary.click();
  });
  if (window.MutationObserver) {
    new MutationObserver(sync).observe(primary, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
  sync();
}

/* ---------- Stepper ---------- */
export function initStepper(root = document) {
  const stepper = root.querySelector(".stepper");
  if (!stepper) return { setStep: () => {} };
  const steps = [...stepper.querySelectorAll(".stepper__step")];

  return {
    setStep(index) {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        step.classList.toggle("is-done", i < index);
        if (i === index) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    },
  };
}

/* ---------- Recent tools ---------- */
const RECENT_KEY = "convertkit:recent";

export function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((id) => getTool(id)) : [];
  } catch {
    return [];
  }
}

export function recordRecent(id) {
  if (!getTool(id)) return;
  try {
    const list = getRecent().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* storage may be unavailable — ignore */
  }
}

/* ---------- Related tools ---------- */
export function renderRelated(currentId, container, count = 3) {
  if (!container) return;
  const current = getTool(currentId);
  if (!current) return;
  const same = TOOLS.filter((t) => t.category === current.category && t.id !== currentId);
  const others = TOOLS.filter((t) => t.category !== current.category && t.id !== currentId);
  const picks = [...same, ...others].slice(0, count);
  const root = getRoot();

  container.innerHTML = picks
    .map(
      (t) => `
      <a class="related-card cat-${t.category}" href="${root}${t.path}">
        <span class="related-card__icon" aria-hidden="true">${ICONS[t.icon] || ICONS.file}</span>
        <span>
          <span class="related-card__name">${escapeHtml(t.name)}</span>
          <span class="related-card__desc">${escapeHtml(t.desc)}</span>
        </span>
      </a>`
    )
    .join("");
}

/* ---------- Dropzone ---------- */
export function setupDropzone(element, options = {}) {
  if (!element) return { reset: () => {} };
  const {
    accept = [],
    multiple = false,
    maxSizeMB = 100,
    onFiles = () => {},
    onError = null,
    paste = false,
    global = true,
  } = options;

  let input = element.querySelector('input[type="file"]');
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.className = "visually-hidden";
    element.appendChild(input);
  }
  input.multiple = multiple;
  if (accept.length) input.accept = accept.join(",");

  const setDragState = (on) => element.classList.toggle("is-dragover", on);

  const handleFiles = (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length) return;
    const selected = multiple ? files : files.slice(0, 1);
    if (!multiple && files.length > 1) {
      showToast("Only one file is used here. Extra files were skipped.", "info");
    }

    const valid = [];
    for (const file of selected) {
      const result = validateFile(file, { accept, maxSizeMB });
      if (result.ok) valid.push(file);
      else if (onError) onError(result.message);
      else showToast(result.message, "error");
    }
    if (valid.length) onFiles(valid);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragState(false);
    handleFiles(event.dataTransfer && event.dataTransfer.files);
  };

  element.addEventListener("click", (event) => {
    if (event.target !== input) {
      event.preventDefault();
      input.click();
    }
  });

  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  input.addEventListener("change", () => {
    handleFiles(input.files);
    input.value = "";
  });

  let dragDepth = 0;
  element.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth += 1;
    setDragState(true);
  });
  element.addEventListener("dragover", (event) => {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    setDragState(true);
  });
  element.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) setDragState(false);
  });
  element.addEventListener("drop", onDrop);

  if (global) {
    document.addEventListener("dragover", (event) => {
      if (event.dataTransfer && [...event.dataTransfer.types].includes("Files")) {
        event.preventDefault();
      }
    });
    document.addEventListener("drop", (event) => {
      if (!event.target.closest || !event.target.closest(".dropzone")) {
        onDrop(event);
      }
    });
  }

  if (paste) {
    document.addEventListener("paste", (event) => {
      const files = [...(event.clipboardData?.files || [])];
      if (files.length) {
        event.preventDefault();
        handleFiles(files);
      }
    });
  }

  return {
    reset() {
      input.value = "";
      setDragState(false);
    },
    open() {
      input.click();
    },
  };
}

/* ---------- Page range parsing ---------- */
export function parsePageRange(value, maxPages) {
  const text = String(value || "").trim();
  if (!text) return { error: "Enter at least one page or range." };

  const pages = [];
  const seen = new Set();
  const parts = text.split(",");

  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) return { error: `“${text}” contains an empty range.` };
    const m = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) return { error: `“${part}” is not a valid page or range. Use numbers like 1-3, 5.` };

    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    if (start < 1 || end < 1) return { error: "Page numbers start at 1." };
    if (start > end) return { error: `Range “${part}” is backwards.` };
    if (end > maxPages) {
      return { error: `This PDF has ${maxPages} pages, but “${part}” goes past the end.` };
    }

    for (let p = start; p <= end; p += 1) {
      if (!seen.has(p)) {
        seen.add(p);
        pages.push(p);
      }
    }
  }

  if (!pages.length) return { error: "No pages were selected." };
  return { pages };
}

/* ---------- Clipboard ---------- */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard.", "success", 2800);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      showToast("Copied to clipboard.", "success", 2800);
      return true;
    } catch {
      showToast("Could not copy. Select the text and copy it manually.", "error");
      return false;
    }
  }
}

/* ---------- File card helper ---------- */
export function fileIconFor(file) {
  const type = file.type || "";
  const name = file.name.toLowerCase();
  if (type.startsWith("image/")) return ICONS.image;
  if (type === "application/pdf" || name.endsWith(".pdf")) return ICONS.pdf;
  if (type.includes("spreadsheet") || /\.(csv|xlsx|xls)$/.test(name)) return ICONS.table;
  if (type.includes("word") || name.endsWith(".docx")) return ICONS.document;
  return ICONS.file;
}

/* ---------- Global UI: header, footer, palette ---------- */
function navLinks(root, currentCategory) {
  return Object.entries(CATEGORIES)
    .filter(([key]) => TOOLS.some((t) => t.category === key))
    .map(
      ([key, cat]) =>
        `<a class="site-nav__link" href="${root}index.html#${cat.id}"${
          currentCategory === key ? ' aria-current="page"' : ""
        }>${cat.short}</a>`
    )
    .join("");
}

function renderHeader(root, tool) {
  const host = document.getElementById("site-header");
  if (!host) return;
  const currentCategory = tool ? tool.category : null;

  host.innerHTML = `
    <header class="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="${root}index.html" aria-label="ConvertKit home">
          <span class="brand__mark" aria-hidden="true">${ICONS.sparkles}</span>
          <span class="brand__name">Convert<span>Kit</span></span>
        </a>
        <nav class="site-nav" aria-label="Primary">
          ${navLinks(root, currentCategory)}
          <a class="site-nav__link" href="${root}about.html">About</a>
        </nav>
        <div class="header-actions">
          <button class="icon-btn" type="button" id="open-palette" aria-label="Search tools (Ctrl+K)" title="Search tools (⌘K)">
            ${ICONS.search}
          </button>
          <button class="icon-btn" type="button" id="theme-toggle" aria-label="Switch colour theme" title="Switch theme">
            <span class="theme-icon" aria-hidden="true"></span>
          </button>
          <button class="icon-btn nav-toggle" type="button" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
            ${ICONS.menu}
          </button>
        </div>
      </div>
      <div class="mobile-nav" id="mobile-nav">
        ${Object.entries(CATEGORIES)
          .filter(([key]) => TOOLS.some((t) => t.category === key))
          .map(
            ([key, cat]) => `
          <div class="mobile-nav__group">
            <p class="mobile-nav__label">${cat.name}</p>
            ${TOOLS.filter((t) => t.category === key)
              .map(
                (t) =>
                  `<a class="mobile-nav__link" href="${root}${t.path}">${escapeHtml(t.name)} <span aria-hidden="true">${ICONS.arrowRight}</span></a>`
              )
              .join("")}
          </div>`
          )
          .join("")}
        <div class="mobile-nav__group">
          <p class="mobile-nav__label">Site</p>
          <a class="mobile-nav__link" href="${root}about.html">About</a>
          <a class="mobile-nav__link" href="${root}privacy.html">Privacy</a>
          <a class="mobile-nav__link" href="${root}terms.html">Terms</a>
          <a class="mobile-nav__link" href="${root}contact.html">Contact</a>
        </div>
      </div>
    </header>
  `;

  const toggle = host.querySelector("#nav-toggle");
  const mobileNav = host.querySelector("#mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = open ? ICONS.x : ICONS.menu;
    });
    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = ICONS.menu;
      }
    });
  }
}

function renderFooter(root) {
  const host = document.getElementById("site-footer");
  if (!host) return;
  const year = new Date().getFullYear();

  host.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="site-footer__inner">
          <div class="site-footer__brand">
            <a class="brand" href="${root}index.html">
              <span class="brand__mark" aria-hidden="true">${ICONS.sparkles}</span>
              <span class="brand__name">Convert<span>Kit</span></span>
            </a>
            <p>Free document and image tools that run entirely in your browser. No uploads, no accounts, no tracking.</p>
            <span class="trust-pill">${ICONS.shield} Files never leave your device</span>
          </div>
          ${Object.entries(CATEGORIES)
            .filter(([key]) => TOOLS.some((t) => t.category === key))
            .map(
              ([key, cat]) => `
            <div class="site-footer__col">
              <h3>${cat.name}</h3>
              <ul>
                ${TOOLS.filter((t) => t.category === key)
                  .map((t) => `<li><a href="${root}${t.path}">${escapeHtml(t.name)}</a></li>`)
                  .join("")}
              </ul>
            </div>`
            )
            .join("")}
        </div>
        <div class="site-footer__bottom">
          <p>© ${year} ConvertKit. Built for the open web.</p>
          <p>
            <a href="${root}about.html">About</a> ·
            <a href="${root}privacy.html">Privacy</a> ·
            <a href="${root}terms.html">Terms</a> ·
            <a href="${root}contact.html">Contact</a> ·
            <a href="${root}index.html">All tools</a>
          </p>
        </div>
      </div>
    </footer>
  `;
}

/* ---------- Command palette ---------- */
function initCommandPalette(root) {
  let backdrop = null;
  let input = null;
  let list = null;
  let activeIndex = 0;
  let filtered = TOOLS;

  const build = () => {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "palette-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <div class="palette" role="dialog" aria-modal="true" aria-label="Search tools">
        <div class="palette__input-wrap">
          ${ICONS.search}
          <input class="palette__input" type="text" placeholder="Search tools…" aria-label="Search tools" autocomplete="off" spellcheck="false">
        </div>
        <div class="palette__list" role="listbox" aria-label="Tools"></div>
        <div class="palette__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    input = backdrop.querySelector(".palette__input");
    list = backdrop.querySelector(".palette__list");

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      filtered = TOOLS.filter(
        (t) =>
          `${t.name} ${t.desc} ${t.keywords}`.toLowerCase().includes(q) ||
          (CATEGORIES[t.category] && CATEGORIES[t.category].name.toLowerCase().includes(q))
      );
      activeIndex = 0;
      paint();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
        paint();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        paint();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const pick = filtered[activeIndex];
        if (pick) location.href = root + pick.path;
      }
    });

    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) close();
    });

    list.addEventListener("mousemove", (event) => {
      const item = event.target.closest(".palette__item");
      if (!item) return;
      activeIndex = Number(item.dataset.index);
      paint();
    });

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
      if (event.key === "Escape" && backdrop && !backdrop.hidden) close();
    });
  };

  const paint = () => {
    if (!list) return;
    if (!filtered.length) {
      list.innerHTML = '<p class="palette__empty">No tools match your search.</p>';
      return;
    }
    list.innerHTML = filtered
      .map(
        (t, i) => `
        <a class="palette__item cat-${t.category}${i === activeIndex ? " is-active" : ""}"
           href="${root}${t.path}" role="option" aria-selected="${i === activeIndex}" data-index="${i}">
          <span class="palette__item-icon" aria-hidden="true">${ICONS[t.icon] || ICONS.file}</span>
          <span class="palette__item-body">
            <span class="palette__item-name">${escapeHtml(t.name)}</span>
            <span class="palette__item-cat">${CATEGORIES[t.category].short}</span>
          </span>
        </a>`
      )
      .join("");
    const active = list.children[activeIndex];
    if (active) active.scrollIntoView({ block: "nearest" });
  };

  const open = () => {
    build();
    filtered = TOOLS;
    activeIndex = 0;
    input.value = "";
    paint();
    backdrop.hidden = false;
    input.focus();
  };

  const close = () => {
    if (!backdrop) return;
    backdrop.hidden = true;
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("#open-palette")) {
      event.preventDefault();
      open();
    }
  });
}

/* ---------- Boot ---------- */
export function initChrome() {
  const root = getRoot();
  const toolId = document.body.dataset.tool;
  const tool = toolId ? getTool(toolId) : null;

  renderHeader(root, tool);
  renderFooter(root);

  if (tool) {
    recordRecent(tool.id);
    document.title = document.title || tool.title;
    const related = document.getElementById("related-tools");
    if (related) renderRelated(tool.id, related);
  }

  initCommandPalette(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChrome, { once: true });
} else {
  initChrome();
}
