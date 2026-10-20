/* ============================================================
   ConvertKit — pdf-to-text.js
   Extract text from a PDF using pdf.js getTextContent
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
  parsePageRange,
  readAsArrayBuffer,
  escapeHtml,
  copyText,
  ICONS,
} from "../common.js";

const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "../../vendor/pdfjs-3.11.174.worker.min.js",
  import.meta.url
).href;

const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("file-list");
const optionsPanel = document.getElementById("options-panel");
const convertBtn = document.getElementById("convert-btn");
const convertBtnMobile = document.getElementById("convert-btn-mobile");
const statusEl = document.getElementById("status");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const result = document.getElementById("result");
const resultMeta = document.getElementById("result-meta");
const output = document.getElementById("output");
const rangeInput = document.getElementById("range-input");
const pageBreaksInput = document.getElementById("page-breaks");

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_SIZE_MB = 200;

let entry = null;
let text = "";
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a PDF to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  convertBtn.disabled = false;
  fileList.innerHTML = `
    <article class="file-item">
      <span class="file-item__thumb" aria-hidden="true">${ICONS.pdf}</span>
      <div class="file-item__body">
        <p class="file-item__name">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.pages} pages</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    entry = null;
    renderFile();
  });
  rangeInput.placeholder = `1-${entry.pages}`;
  setStatus(statusEl, `${entry.pages} pages detected. Works with text-based PDFs.`);
  stepper.setStep(1);
}

fileList.addEventListener("click", (event) => {
  if (!event.target.closest("#remove-file")) return;
  entry = null;
  renderFile();
});

async function addFile(files) {
  const file = files[0];
  try {
    const bytes = await readAsArrayBuffer(file);
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    entry = { file, bytes, pages: doc.numPages };
    doc.destroy();
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be opened. It may be corrupted or password-protected.`, "error");
  }
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
});

function setProgress(value, label) {
  progress.hidden = false;
  progressBar.classList.remove("is-indeterminate");
  progressBar.style.width = `${Math.round(value * 100)}%`;
  if (label) progressLabel.textContent = label;
}

async function convert() {
  if (!entry) return;
  stepper.setStep(2);

  const parsed = parsePageRange(rangeInput.value || `1-${entry.pages}`, entry.pages);
  if (parsed.error) {
    showToast(parsed.error, "error");
    rangeInput.focus();
    return;
  }

  const keepBreaks = pageBreaksInput.checked;
  setBusy(convertBtn, true, "Extracting…");
  setProgress(0, "Opening PDF…");

  try {
    const doc = await pdfjsLib.getDocument({ data: entry.bytes.slice(0) }).promise;
    const parts = [];

    for (let i = 0; i < parsed.pages.length; i += 1) {
      const pageNumber = parsed.pages[i];
      setProgress(i / parsed.pages.length, `Reading page ${pageNumber} of ${entry.pages}…`);
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      let lastY = null;
      let pageText = "";
      content.items.forEach((item) => {
        if (!("str" in item)) return;
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 1) pageText += "\n";
        pageText += item.str;
        lastY = item.transform[5];
      });
      parts.push(pageText.trim());
      page.cleanup();
    }
    await doc.destroy();

    text = keepBreaks ? parts.join("\n\n--- page break ---\n\n") : parts.join("\n\n");

    setProgress(1, "Done");
    result.hidden = false;
    const characters = text.replace(/\s/g, "").length;
    resultMeta.textContent = `${characters.toLocaleString()} characters · ${parsed.pages.length} page(s)`;
    output.textContent = text.slice(0, 8000) + (text.length > 8000 ? "\n…" : "");

    if (characters < 10) {
      showToast("Almost no text found. This PDF is probably a scan and needs OCR.", "warning", 7000);
    }

    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    document.getElementById("download-btn").focus();
    stepper.setStep(3);
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while extracting text. The PDF may be corrupted.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

convertBtn.addEventListener("click", convert);

document.getElementById("download-btn").addEventListener("click", () => {
  if (!text) return;
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), entry.file.name.replace(/\.pdf$/i, "") + ".txt");
});

document.getElementById("copy-btn").addEventListener("click", () => {
  if (text) copyText(text);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  entry = null;
  text = "";
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) document.getElementById("reset-btn").click();
});

renderFile();
