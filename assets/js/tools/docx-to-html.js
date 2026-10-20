/* ============================================================
   ConvertKit — docx-to-html.js
   Convert .docx to sanitised HTML or plain text with mammoth
   ============================================================ */
import {
  setupDropzone,
  downloadBlob,
  showToast,
  setBusy,
  setStatus,
  initStepper,
  mirrorButton,
  formatBytes,
  readAsArrayBuffer,
  escapeHtml,
  copyText,
  ICONS,
} from "../common.js";

const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("file-list");
const optionsPanel = document.getElementById("options-panel");
const convertBtn = document.getElementById("convert-btn");
const convertBtnMobile = document.getElementById("convert-btn-mobile");
const statusEl = document.getElementById("status");
const result = document.getElementById("result");
const resultMeta = document.getElementById("result-meta");
const previewFrame = document.getElementById("preview-frame");
const output = document.getElementById("output");
const modeInputs = [...document.querySelectorAll('input[name="mode"]')];
const outputTabs = document.getElementById("output-tabs");

const ACCEPT = [
  ".docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 50;

let entry = null;
let htmlText = "";
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function currentMode() {
  return modeInputs.find((input) => input.checked)?.value || "html";
}

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a .docx file to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  convertBtn.disabled = false;
  fileList.innerHTML = `
    <article class="file-item">
      <span class="file-item__thumb" aria-hidden="true">${ICONS.document}</span>
      <div class="file-item__body">
        <p class="file-item__name">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    entry = null;
    result.hidden = true;
    renderFile();
  });
  setStatus(statusEl, "Ready to convert. Complex layouts are simplified.");
  stepper.setStep(1);
}

fileList.addEventListener("click", (event) => {
  if (!event.target.closest("#remove-file")) return;
  entry = null;
  result.hidden = true;
  renderFile();
});

async function addFile(files) {
  const file = files[0];
  if (!/\.docx$/i.test(file.name)) {
    showToast("Please choose a .docx file. The older .doc format is not supported.", "error");
    return;
  }
  entry = { file };
  result.hidden = true;
  renderFile();
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
});

/* ---------- Convert ---------- */
async function convert() {
  if (!entry) return;
  stepper.setStep(2);
  setBusy(convertBtn, true, "Converting…");

  const mode = currentMode();

  try {
    const buffer = await readAsArrayBuffer(entry.file);
    const mammoth = window.mammoth;

    if (mode === "text") {
      const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
      htmlText = value;
      outputTabs.hidden = true;
      previewFrame.hidden = true;
      output.hidden = false;
      output.textContent = value.slice(0, 8000) + (value.length > 8000 ? "\n…" : "");
      resultMeta.textContent = `Plain text · ${value.length.toLocaleString()} characters`;
    } else {
      const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
      const clean = window.DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
      htmlText = clean;
      outputTabs.hidden = false;
      output.hidden = false;
      output.textContent = clean.slice(0, 8000) + (clean.length > 8000 ? "\n…" : "");
      previewFrame.hidden = false;
      previewFrame.srcdoc = docShell(clean);
      resultMeta.textContent = `HTML · ${new Blob([clean]).size ? formatBytes(new Blob([clean]).size) : "0 B"}`;
    }

    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    stepper.setStep(3);
    showToast("Conversion complete.", "success");
  } catch (error) {
    console.error(error);
    showToast("Could not read this document. It may be corrupted or not a real .docx file.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
  }
}

function docShell(html) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    :root{color-scheme:light}
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#0f172a;margin:0;padding:16px;background:#fff}
    img{max-width:100%;height:auto}
    table{border-collapse:collapse;max-width:100%}
    td,th{border:1px solid #cbd5e1;padding:6px 8px}
    h1,h2,h3{margin:.6em 0 .3em}
    a{color:#4f46e5}
  </style></head><body>${html}</body></html>`;
}

convertBtn.addEventListener("click", convert);

outputTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-view]");
  if (!tab) return;
  outputTabs.querySelectorAll("[data-view]").forEach((el) => {
    const active = el === tab;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-selected", String(active));
  });
  const showPreview = tab.dataset.view === "preview";
  previewFrame.hidden = !showPreview;
  output.hidden = showPreview;
});

document.getElementById("download-html").addEventListener("click", () => {
  if (!htmlText) return;
  const wrapped = docShell(htmlText);
  downloadBlob(new Blob([wrapped], { type: "text/html;charset=utf-8" }), entry.file.name.replace(/\.docx$/i, "") + ".html");
});

document.getElementById("copy-btn").addEventListener("click", () => {
  if (htmlText) copyText(htmlText);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  entry = null;
  htmlText = "";
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) document.getElementById("reset-btn").click();
});

renderFile();
