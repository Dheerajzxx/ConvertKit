/* ============================================================
   ConvertKit — image-compressor.js
   Compress and resize a single image with a before/after preview
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
  loadImage,
  canvasToBlob,
  escapeHtml,
  ICONS,
} from "../common.js";

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
const statsEl = document.getElementById("stats");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");
const compare = document.getElementById("compare");
const compareRange = document.getElementById("compare-range");
const compareHandle = document.getElementById("compare-handle");
const beforeWrap = document.getElementById("compare-before");
const beforeImg = document.getElementById("img-before");
const afterImg = document.getElementById("img-after");
const qualityInput = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");
const formatInputs = [...document.querySelectorAll('input[name="format"]')];
const maxWidthInput = document.getElementById("max-width");
const keepRatioInput = document.getElementById("keep-ratio");

const ACCEPT = ["image/jpeg", "image/png", "image/webp", ".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE_MB = 50;
const MAX_DIMENSION = 6000;

let entry = null;
let output = null;
let originalUrl = null;
let compressedUrl = null;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function currentFormat() {
  return formatInputs.find((input) => input.checked)?.value || "image/jpeg";
}

qualityInput.addEventListener("input", () => {
  qualityValue.textContent = `${qualityInput.value}%`;
});
formatInputs.forEach((input) => input.addEventListener("change", () => {
  qualityInput.disabled = input.value === "image/png" && input.checked;
}));

/* ---------- File ---------- */
function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add an image to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  convertBtn.disabled = false;
  maxWidthInput.value = entry.width;
  fileList.innerHTML = `
    <article class="file-item">
      <span class="file-item__thumb"><img src="${originalUrl}" alt="" width="44" height="44"></span>
      <div class="file-item__body">
        <p class="file-item__name">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.width}×${entry.height}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    resetEntry();
  });
  setStatus(statusEl, "Tune the quality and size, then compress.");
  stepper.setStep(1);
}

function resetEntry() {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  originalUrl = null;
  compressedUrl = null;
  entry = null;
  output = null;
  result.hidden = true;
  renderFile();
}

async function addFile(files) {
  const file = files[0];
  resetEntry();
  try {
    const img = await loadImage(file);
    originalUrl = URL.createObjectURL(file);
    entry = { file, width: img.naturalWidth, height: img.naturalHeight };
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be read as an image.`, "error");
  }
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
  paste: true,
});

/* ---------- Compare slider ---------- */
compareRange.addEventListener("input", () => {
  const pct = Number(compareRange.value);
  beforeWrap.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  compareHandle.style.left = `${pct}%`;
});

/* ---------- Convert ---------- */
function setProgress(value, label) {
  progress.hidden = false;
  progressBar.classList.remove("is-indeterminate");
  progressBar.style.width = `${Math.round(value * 100)}%`;
  if (label) progressLabel.textContent = label;
}

async function compress() {
  if (!entry) return;
  stepper.setStep(2);
  setBusy(convertBtn, true, "Compressing…");
  setProgress(0.2, "Re-encoding image…");

  try {
    const format = currentFormat();
    const quality = Number(qualityInput.value) / 100;
    const maxWidth = Math.max(1, Number(maxWidthInput.value) || entry.width);
    const keepRatio = keepRatioInput.checked;

    const img = await loadImage(entry.file);
    let targetW = Math.min(maxWidth, MAX_DIMENSION);
    let targetH = keepRatio
      ? Math.round((targetW / entry.width) * entry.height)
      : entry.height;
    if (targetW < 1) targetW = 1;

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    setProgress(0.7, "Saving…");
    const type = format === "image/png" ? "image/png" : format;
    const blob = await canvasToBlob(canvas, type, quality);
    canvas.width = 0;
    canvas.height = 0;

    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    output = {
      blob,
      name: `${entry.file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`,
      width: targetW,
      height: targetH,
    };

    setProgress(1, "Done");
    showResult();
    stepper.setStep(3);

    const saved = entry.file.size - blob.size;
    if (saved > 0) showToast(`Saved ${formatBytes(saved)} (${Math.round((saved / entry.file.size) * 100)}%).`, "success");
    else showToast("Compressed. This image was already well optimised.", "info");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while compressing the image.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

function showResult() {
  result.hidden = false;
  if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  compressedUrl = URL.createObjectURL(output.blob);

  beforeImg.src = originalUrl;
  afterImg.src = compressedUrl;
  compare.hidden = false;
  beforeWrap.style.clipPath = "inset(0 50% 0 0)";
  compareHandle.style.left = "50%";
  compareRange.value = "50";

  const saved = entry.file.size - output.blob.size;
  const pct = entry.file.size ? Math.round((saved / entry.file.size) * 100) : 0;

  resultMeta.textContent = `${output.width}×${output.height} · ${formatBytes(output.blob.size)}`;
  statsEl.innerHTML = `
    <span class="stat">Before <strong>${formatBytes(entry.file.size)}</strong></span>
    <span class="stat">After <strong>${formatBytes(output.blob.size)}</strong></span>
    <span class="stat ${saved > 0 ? "stat--good" : ""}">Saved <strong>${pct > 0 ? `${pct}%` : "0%"}</strong></span>`;

  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  downloadBtn.focus();
}

convertBtn.addEventListener("click", compress);
downloadBtn.addEventListener("click", () => {
  if (output) downloadBlob(output.blob, output.name);
});
resetBtn.addEventListener("click", () => {
  resetEntry();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) resetBtn.click();
});

renderFile();
