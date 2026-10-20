/* ============================================================
   ConvertKit — image-to-pdf.js
   Combine JPG / PNG / WebP images into a single PDF
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
  fileIconFor,
  loadImage,
  canvasToBlob,
  readAsArrayBuffer,
  escapeHtml,
  ICONS,
} from "../common.js";

const { PDFDocument } = PDFLib;

const PAGE_SIZES = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
};

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
const pageSizeSelect = document.getElementById("page-size");
const orientationSelect = document.getElementById("orientation");
const marginInput = document.getElementById("margin");
const marginValue = document.getElementById("margin-value");

const ACCEPT = ["image/jpeg", "image/png", "image/webp", ".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE_MB = 50;
const MAX_DIMENSION = 3000;

let files = [];
let outputBlob = null;
let counter = 0;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

/* ---------- Render ---------- */
function renderList() {
  fileList.innerHTML = files
    .map(
      (entry, index) => `
    <article class="file-item" draggable="true" data-id="${entry.id}">
      <span class="drag-handle" aria-hidden="true" title="Drag to reorder">${ICONS.grip}</span>
      <span class="file-item__index" aria-hidden="true">${index + 1}</span>
      <span class="file-item__thumb">
        <img src="${entry.thumb}" alt="" width="44" height="44" loading="lazy">
      </span>
      <div class="file-item__body">
        <p class="file-item__name" title="${escapeHtml(entry.file.name)}">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.width}×${entry.height}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" data-action="up" data-id="${entry.id}" aria-label="Move up"${index === 0 ? " disabled" : ""}>${ICONS.up}</button>
        <button class="btn btn-icon" type="button" data-action="down" data-id="${entry.id}" aria-label="Move down"${index === files.length - 1 ? " disabled" : ""}>${ICONS.down}</button>
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
    setStatus(statusEl, `${files.length} image${files.length === 1 ? "" : "s"} ready. Drag to set the page order.`);
    stepper.setStep(1);
  }
  wireDrag();
}

function wireDrag() {
  let dragId = null;
  fileList.querySelectorAll(".file-item").forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      dragId = item.dataset.id;
      item.classList.add("is-dragging");
      event.dataTransfer?.setData("text/plain", dragId);
    });
    item.addEventListener("dragend", () => {
      dragId = null;
      fileList.querySelectorAll(".file-item").forEach((el) => el.classList.remove("is-dragging"));
    });
    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (!dragId || dragId === item.dataset.id) return;
      const from = files.findIndex((f) => f.id === dragId);
      const to = files.findIndex((f) => f.id === item.dataset.id);
      if (from === -1 || to === -1) return;
      const [moved] = files.splice(from, 1);
      files.splice(to, 0, moved);
marginInput.addEventListener("input", () => {
  marginValue.textContent = `${marginInput.value} mm`;
});

renderList();
    });
  });
}

fileList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  const index = files.findIndex((f) => f.id === id);
  if (index === -1) return;
  if (action === "remove") {
    const [removed] = files.splice(index, 1);
    if (removed.thumb) URL.revokeObjectURL(removed.thumb);
  } else if (action === "up" && index > 0) {
    [files[index - 1], files[index]] = [files[index], files[index - 1]];
  } else if (action === "down" && index < files.length - 1) {
    [files[index + 1], files[index]] = [files[index], files[index + 1]];
  }
  renderList();
});

/* ---------- Add ---------- */
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

function fittedCanvas(img, margin) {
  const availW = PAGE_SIZES.A4[0] - margin * 2;
  const maxW = Math.min(MAX_DIMENSION, img.naturalWidth);
  const scale = Math.min(1, maxW / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

async function convert() {
  if (!files.length) return;
  stepper.setStep(2);
  setBusy(convertBtn, true, "Building PDF…");
  setProgress(0, "Reading images…");

  const sizeMode = pageSizeSelect.value;
  const orientation = orientationSelect.value;
  const margin = Number(marginInput.value) || 0;
  const marginPt = margin * 2.8346;

  try {
    const pdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i += 1) {
      setProgress(i / files.length, `Adding image ${i + 1} of ${files.length}…`);
      const entry = files[i];
      const img = await loadImage(entry.file);
      const { canvas } = fittedCanvas(img, marginPt);
      const jpegBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      const bytes = await readAsArrayBuffer(jpegBlob);
      const embedded = await pdf.embedJpg(bytes);

      let page;
      if (sizeMode === "fit") {
        page = pdf.addPage([embedded.width + marginPt * 2, embedded.height + marginPt * 2]);
      } else {
        const [w, h] = PAGE_SIZES[sizeMode];
        const landscape = orientation === "landscape" || (orientation === "auto" && entry.width > entry.height);
        page = pdf.addPage(landscape ? [h, w] : [w, h]);
      }

      const { width: pw, height: ph } = page.getSize();
      const availW = Math.max(1, pw - marginPt * 2);
      const availH = Math.max(1, ph - marginPt * 2);
      const ratio = Math.min(availW / embedded.width, availH / embedded.height);
      const drawW = embedded.width * ratio;
      const drawH = embedded.height * ratio;
      page.drawImage(embedded, {
        x: (pw - drawW) / 2,
        y: (ph - drawH) / 2,
        width: drawW,
        height: drawH,
      });
      canvas.width = 0;
      canvas.height = 0;
    }

    setProgress(0.95, "Saving PDF…");
    const bytes = await pdf.save({ useObjectStreams: true });
    outputBlob = new Blob([bytes], { type: "application/pdf" });

    setProgress(1, "Done");
    result.hidden = false;
    resultMeta.textContent = `${files.length} pages · ${formatBytes(outputBlob.size)}`;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    downloadBtn.focus();
    stepper.setStep(3);
    showToast("PDF created successfully.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while building the PDF. Try fewer or smaller images.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

convertBtn.addEventListener("click", convert);
downloadBtn.addEventListener("click", () => {
  if (outputBlob) downloadBlob(outputBlob, "images.pdf");
});

resetBtn.addEventListener("click", () => {
  files.forEach((f) => f.thumb && URL.revokeObjectURL(f.thumb));
  files = [];
  outputBlob = null;
  result.hidden = true;
  renderList();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) {
    resetBtn.click();
  }
});

renderList();
