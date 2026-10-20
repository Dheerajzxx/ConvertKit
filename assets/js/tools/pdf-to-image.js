/* ============================================================
   ConvertKit — pdf-to-image.js
   Render PDF pages to JPG or PNG using pdf.js
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
  canvasToBlob,
  readAsArrayBuffer,
  escapeHtml,
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
const resultPreview = document.getElementById("result-preview");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");
const formatSelect = document.getElementById("format");
const scaleSelect = document.getElementById("scale");
const rangeInput = document.getElementById("range-input");
const qualityField = document.getElementById("quality-field");
const qualityInput = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_SIZE_MB = 200;

let entry = null;
let output = null;
let previewUrl = null;
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

/* ---------- Fields ---------- */
qualityField.hidden = formatSelect.value !== "image/jpeg";
formatSelect.addEventListener("change", () => {
  qualityField.hidden = formatSelect.value !== "image/jpeg";
});
qualityInput.addEventListener("input", () => {
  qualityValue.textContent = `${qualityInput.value}%`;
});

/* ---------- File ---------- */
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
  setStatus(statusEl, `${entry.pages} pages detected. Choose format and resolution.`);
  stepper.setStep(1);
}

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
    showToast(
      `"${file.name}" could not be opened. It may be corrupted or password-protected.`,
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

  const parsed = parsePageRange(rangeInput.value || `1-${entry.pages}`, entry.pages);
  if (parsed.error) {
    showToast(parsed.error, "error");
    rangeInput.focus();
    return;
  }

  const format = formatSelect.value;
  const scale = Number(scaleSelect.value);
  const quality = Number(qualityInput.value) / 100;
  const ext = format === "image/png" ? "png" : "jpg";
  const base = entry.file.name.replace(/\.pdf$/i, "");

  setBusy(convertBtn, true, "Rendering…");
  setProgress(0, "Opening PDF…");

  try {
    const doc = await pdfjsLib.getDocument({ data: entry.bytes.slice(0) }).promise;
    const images = [];

    for (let i = 0; i < parsed.pages.length; i += 1) {
      const pageNumber = parsed.pages[i];
      setProgress(i / parsed.pages.length, `Rendering page ${pageNumber} of ${entry.pages}…`);
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await canvasToBlob(canvas, format, format === "image/jpeg" ? quality : 0.92);
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      images.push({ name: `${base}-page-${pageNumber}.${ext}`, blob });
    }
    await doc.destroy();

    if (images.length === 1) {
      output = { kind: "blob", blob: images[0].blob, name: images[0].name };
    } else {
      setProgress(0.95, "Packaging images…");
      const zip = new JSZip();
      images.forEach((img) => zip.file(img.name, img.blob));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      output = { kind: "zip", blob: zipBlob, name: `${base}-images.zip`, count: images.length };
    }

    setProgress(1, "Done");
    showResult(images[0].blob, ext);
    stepper.setStep(3);
    showToast("Images rendered.", "success");
  } catch (error) {
    console.error(error);
    showToast("Something went wrong while rendering. The PDF may be corrupted or protected.", "error");
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => (progress.hidden = true), 500);
  }
}

function showResult(firstBlob, ext) {
  result.hidden = false;
  if (output.kind === "zip") {
    resultMeta.textContent = `${output.count} images in a ZIP · ${formatBytes(output.blob.size)}`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download ZIP</span>`;
  } else {
    resultMeta.textContent = `1 image · ${formatBytes(output.blob.size)}`;
    downloadBtn.innerHTML = `${ICONS.download}<span>Download image</span>`;
  }
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(firstBlob);
  resultPreview.hidden = false;
  resultPreview.innerHTML = `<img src="${previewUrl}" alt="Preview of the first rendered page (${ext.toUpperCase()})" width="640" height="480" loading="lazy">`;
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
  resultPreview.innerHTML = "";
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") resetBtn.click();
});

rangeInput.value = "";
renderFile();
