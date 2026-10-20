/* ============================================================
   ConvertKit — image-converter.js
   Convert between PNG, JPG and WebP with quality and batch ZIP
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
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");
const formatInputs = [...document.querySelectorAll('input[name="format"]')];
const qualityField = document.getElementById("quality-field");
const qualityInput = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");
const backgroundRow = document.getElementById("background-row");
const backgroundInput = document.getElementById("background");

const ACCEPT = ["image/jpeg", "image/png", "image/webp", ".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE_MB = 50;
const MAX_DIMENSION = 4096;

let files = [];
let output = null;
let counter = 0;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function currentFormat() {
  return formatInputs.find((input) => input.checked)?.value || "image/jpeg";
}

function syncOptions() {
  const format = currentFormat();
  qualityField.hidden = format === "image/png";
  backgroundRow.hidden = format !== "image/jpeg";
}

formatInputs.forEach((input) => input.addEventListener("change", syncOptions));
qualityInput.addEventListener("input", () => {
  qualityValue.textContent = `${qualityInput.value}%`;
});
syncOptions();

/* ---------- Render ---------- */
function renderList() {
  fileList.innerHTML = files
    .map(
      (entry, index) => `
    <article class="file-item" data-id="${entry.id}">
      <span class="file-item__index" aria-hidden="true">${index + 1}</span>
      <span class="file-item__thumb"><img src="${entry.thumb}" alt="" width="44" height="44" loading="lazy"></span>
      <div class="file-item__body">
        <p class="file-item__name" title="${escapeHtml(entry.file.name)}">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.width}×${entry.height}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" data-action="remove" data-id="${entry.id}" aria-label="Remove">${ICONS.trash}</button>
      </div>
    </article>`
    )
    .join("");

  optionsPanel.hidden = files.length === 0;
  convertBtn.disabled = files.length === 0;
  if (!files.length) {
    setStatus(statusEl, "Add images to begin.");
    stepper.setStep(0);
  } else {
    setStatus(statusEl, `${files.length} image${files.length === 1 ? "" : "s"} ready.`);
    stepper.setStep(1);
  }
}

fileList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = files.findIndex((f) => f.id === button.dataset.id);
  if (index === -1) return;
  const [removed] = files.splice(index, 1);
  if (removed.thumb) URL.revokeObjectURL(removed.thumb);
  renderList();
});

async function addFiles(incoming) {
  for (const file of incoming) {
    try {
      const img = await loadImage(file);
      files.push({
        id: `i${counter++}`,
        file,
        width: img.naturalWidth,
        height: img.naturalHeight,
        thumb: URL.createObjectURL(file),
      });
    } catch (error) {
      console.error(error);
      showToast(`"${file.name}" could not be read as an image.`, "error");
    }
  }
  result.hidden = true;
  renderList();
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: true,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFiles,
  paste: true,
});

/* ---------- Convert ---------- */
function setProgress(value, label) {
  progress.hidden = false;
  progressBar.classList.remove("is-indeterminate");
  progressBar.style.width = `${Math.round(value * 100)}%`;
  if (label) progressLabel.textContent = label;
}

function toCanvas(img, background) {
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background || "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

async function convert() {
  if (!files.length) return;
  stepper.setStep(2);

  const format = currentFormat();
  const quality = Number(qualityInput.value) / 100;
  const background = backgroundInput.value || "#ffffff";
  const ext = format.split("/")[1].replace("jpeg", "jpg");

  setBusy(convertBtn, true, "Converting…");
  setProgress(0, "Converting images…");

  try {
    const results = [];
    for (let i = 0; i < files.length; i += 1) {
      const entry = files[i];
      setProgress(i / files.length, `Converting ${entry.file.name}…`);
      const img = await loadImage(entry.file);
      const canvas = toCanvas(img, format === "image/jpeg" ? background : null);
      const type = format === "image/png" ? "image/png" : format;
      const blob = await canvasToBlob(canvas, type, quality);
      canvas.width = 0;
      canvas.height = 0;
      results.push({
        name: `${entry.file.name.replace(/\.[^.]+$/, "")}.${ext}`,
        blob,
        from: entry.file.size,
      });
    }

    if (results.length === 1) {
      output = { kind: "blob", blob: results[0].blob, name: results[0].name, items: results };
    } else {
      setProgress(0.95, "Packaging ZIP…");
      const zip = new JSZip();
      results.forEach((r) => zip.file(r.name, r.blob));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      output = { kind: "zip", blob: zipBlob, name: "converted-images.zip", items: results };
    }

    setProgress(1, "Done");
    showResult(ext.toUpperCase());
    stepper.setStep(3);
    showToast("Conversion complete.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while converting the images.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

function showResult(formatName) {
  result.hidden = false;
  const total = output.items.reduce((sum, item) => sum + item.blob.size, 0);
  if (output.kind === "zip") {
    resultMeta.textContent = `${output.items.length} ${formatName} images in a ZIP · ${formatBytes(output.blob.size)}`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download ZIP</span>`;
  } else {
    const saved = output.items[0].from
      ? Math.round((1 - output.items[0].blob.size / output.items[0].from) * 100)
      : 0;
    resultMeta.textContent = `1 ${formatName} image · ${formatBytes(output.blob.size)}${
      saved > 0 ? ` · ${saved}% smaller` : ""
    }`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download image</span>`;
  }
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  downloadBtn.focus();
}

convertBtn.addEventListener("click", convert);
downloadBtn.addEventListener("click", () => {
  if (output) downloadBlob(output.blob, output.name);
});

resetBtn.addEventListener("click", () => {
  files.forEach((f) => f.thumb && URL.revokeObjectURL(f.thumb));
  files = [];
  output = null;
  result.hidden = true;
  renderList();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) resetBtn.click();
});

renderList();
