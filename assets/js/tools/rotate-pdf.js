/* ============================================================
   ConvertKit — rotate-pdf.js
   Rotate selected pages (or all) by 90° steps with pdf-lib
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

const { PDFDocument, degrees } = PDFLib;

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
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");
const angleInputs = [...document.querySelectorAll('input[name="angle"]')];
const scopeInputs = [...document.querySelectorAll('input[name="scope"]')];
const rangeField = document.getElementById("range-field");
const rangeInput = document.getElementById("range-input");

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_SIZE_MB = 200;

let entry = null;
let outputBlob = null;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function currentAngle() {
  return Number(angleInputs.find((input) => input.checked)?.value || 90);
}

function syncScope() {
  const scope = scopeInputs.find((input) => input.checked)?.value || "all";
  rangeField.hidden = scope !== "range";
}
scopeInputs.forEach((input) => input.addEventListener("change", syncScope));
syncScope();

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
  setStatus(statusEl, `${entry.pages} pages detected. Choose a rotation.`);
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
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be read. It may be corrupted or password-protected.`, "error");
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

  const scope = scopeInputs.find((input) => input.checked)?.value || "all";
  const angle = currentAngle();
  let targets = "all";

  if (scope === "range") {
    const parsed = parsePageRange(rangeInput.value, entry.pages);
    if (parsed.error) {
      showToast(parsed.error, "error");
      rangeInput.focus();
      return;
    }
    targets = parsed.pages;
  }

  setBusy(convertBtn, true, "Rotating…");
  setProgress(0.3, "Applying rotation…");

  try {
    const doc = await PDFDocument.load(entry.bytes, { ignoreEncryption: true });
    const pages = doc.getPages();
    const targetSet = targets === "all" ? null : new Set(targets);

    pages.forEach((page, index) => {
      if (targetSet && !targetSet.has(index + 1)) return;
      const current = page.getRotation().angle || 0;
      page.setRotation(degrees(((current + angle) % 360 + 360) % 360));
    });

    setProgress(0.8, "Saving…");
    const bytes = await doc.save({ useObjectStreams: true });
    outputBlob = new Blob([bytes], { type: "application/pdf" });

    setProgress(1, "Done");
    result.hidden = false;
    resultMeta.textContent = `${targets === "all" ? entry.pages : targets.length} page(s) rotated ${angle}° · ${formatBytes(outputBlob.size)}`;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    downloadBtn.focus();
    stepper.setStep(3);
    showToast("Rotation applied.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while rotating. The PDF may be corrupted.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

convertBtn.addEventListener("click", convert);
downloadBtn.addEventListener("click", () => {
  if (outputBlob) {
    downloadBlob(outputBlob, entry.file.name.replace(/\.pdf$/i, "") + "-rotated.pdf");
  }
});

resetBtn.addEventListener("click", () => {
  entry = null;
  outputBlob = null;
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) resetBtn.click();
});

renderFile();
