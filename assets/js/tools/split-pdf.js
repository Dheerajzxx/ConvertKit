/* ============================================================
   ConvertKit — split-pdf.js
   Extract page ranges, split every N pages, or split into single pages
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
  ICONS,
} from "../common.js";

const { PDFDocument } = PDFLib;

const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("file-list");
const fileInfo = document.getElementById("file-info");
const optionsPanel = document.getElementById("options-panel");
const modeInputs = [...document.querySelectorAll('input[name="mode"]')];
const rangeField = document.getElementById("range-field");
const rangeInput = document.getElementById("range-input");
const everyField = document.getElementById("every-field");
const everyInput = document.getElementById("every-input");
const convertBtn = document.getElementById("convert-btn");
const convertBtnMobile = document.getElementById("convert-btn-mobile");
const statusEl = document.getElementById("status");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const result = document.getElementById("result");
const resultMeta = document.getElementById("result-meta");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_SIZE_MB = 200;

let entry = null;
let output = null;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    fileInfo.hidden = true;
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a PDF to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  fileInfo.hidden = false;
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
  setStatus(statusEl, `${entry.pages} pages detected. Choose how to split.`);
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
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    entry = { file, bytes, pages: doc.getPageCount() };
    output = null;
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(
      `"${file.name}" could not be read. It may be corrupted or password-protected.`,
      "error"
    );
  }
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
  paste: true,
});

/* ---------- Modes ---------- */
function currentMode() {
  return modeInputs.find((input) => input.checked)?.value || "range";
}

function syncFields() {
  const mode = currentMode();
  rangeField.hidden = mode !== "range";
  everyField.hidden = mode !== "every";
  setStatus(statusEl, mode === "single" ? "Each page will become its own PDF, packed into a ZIP." : "");
}

modeInputs.forEach((input) => input.addEventListener("change", syncFields));
syncFields();

/* ---------- Convert ---------- */
function setProgress(value, label) {
  progress.hidden = false;
  progressBar.classList.remove("is-indeterminate");
  progressBar.style.width = `${Math.round(value * 100)}%`;
  if (label) progressLabel.textContent = label;
}

async function convert() {
  if (!entry) return;
  stepper.setStep(2);

  const mode = currentMode();
  let pages;
  let inputs = [];

  if (mode === "range") {
    const parsed = parsePageRange(rangeInput.value, entry.pages);
    if (parsed.error) {
      showToast(parsed.error, "error");
      rangeInput.focus();
      return;
    }
    pages = parsed.pages;
    inputs = [{ pages, name: `${baseName(entry.file.name)}-pages.pdf` }];
  } else if (mode === "every") {
    const step = Number(everyInput.value);
    if (!Number.isInteger(step) || step < 1 || step > entry.pages) {
      showToast(`Choose a chunk size between 1 and ${entry.pages}.`, "error");
      everyInput.focus();
      return;
    }
    for (let start = 1; start <= entry.pages; start += step) {
      const chunk = [];
      for (let p = start; p < start + step && p <= entry.pages; p += 1) chunk.push(p);
      inputs.push({ pages: chunk, name: `${baseName(entry.file.name)}-pages-${start}-${chunk.at(-1)}.pdf` });
    }
  } else {
    for (let p = 1; p <= entry.pages; p += 1) {
      inputs.push({ pages: [p], name: `${baseName(entry.file.name)}-page-${p}.pdf` });
    }
  }

  setBusy(convertBtn, true, "Splitting…");
  setProgress(0, "Splitting…");

  try {
    const source = await PDFDocument.load(entry.bytes, { ignoreEncryption: true });
    const chunks = [];

    for (let i = 0; i < inputs.length; i += 1) {
      const spec = inputs[i];
      setProgress(i / inputs.length, `Building file ${i + 1} of ${inputs.length}…`);
      const doc = await PDFDocument.create();
      const copied = await doc.copyPages(source, spec.pages.map((p) => p - 1));
      copied.forEach((page) => doc.addPage(page));
      const bytes = await doc.save({ useObjectStreams: true });
      chunks.push({
        name: spec.name,
        blob: new Blob([bytes], { type: "application/pdf" }),
      });
    }

    setProgress(0.95, "Packaging…");
    if (chunks.length === 1) {
      output = { kind: "blob", blob: chunks[0].blob, name: chunks[0].name };
    } else {
      const zip = new JSZip();
      chunks.forEach((chunk) => zip.file(chunk.name, chunk.blob));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      output = {
        kind: "zip",
        blob: zipBlob,
        name: `${baseName(entry.file.name)}-split.zip`,
        fileCount: chunks.length,
      };
    }

    setProgress(1, "Done");
    showResult();
    stepper.setStep(3);
    showToast("Split complete.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while splitting. The PDF may be corrupted.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => {
      progress.hidden = true;
    }, 500);
  }
}

function baseName(name) {
  return name.replace(/\.pdf$/i, "");
}

function showResult() {
  result.hidden = false;
  if (output.kind === "zip") {
    resultMeta.textContent = `${output.fileCount} PDFs packaged in a ZIP · ${formatBytes(output.blob.size)}`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download ZIP</span>`;
  } else {
    resultMeta.textContent = `1 PDF · ${formatBytes(output.blob.size)}`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download PDF</span>`;
  }
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  downloadBtn.focus();
}

convertBtn.addEventListener("click", convert);

downloadBtn.addEventListener("click", () => {
  if (output) downloadBlob(output.blob, output.name);
});

resetBtn.addEventListener("click", () => {
  entry = null;
  output = null;
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    entry = null;
    output = null;
    result.hidden = true;
    renderFile();
  }
});

rangeInput.value = "1-";
renderFile();
