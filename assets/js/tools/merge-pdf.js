/* ============================================================
   ConvertKit — merge-pdf.js
   Reference tool implementation: dropzone -> reorder -> convert -> download
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
  ICONS,
  escapeHtml,
  readAsArrayBuffer,
} from "../common.js";

const { PDFDocument } = PDFLib;

const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("file-list");
const convertBtn = document.getElementById("convert-btn");
const convertBtnMobile = document.getElementById("convert-btn-mobile");
const clearBtn = document.getElementById("clear-btn");
const statusEl = document.getElementById("status");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressPct = document.getElementById("progress-pct");
const result = document.getElementById("result");
const resultMeta = document.getElementById("result-meta");
const resultTitle = document.getElementById("result-title");
const downloadBtn = document.getElementById("download-btn");
const resetBtn = document.getElementById("reset-btn");

const ACCEPT = ["application/pdf", ".pdf"];
const MAX_SIZE_MB = 200;

let files = [];
let outputBlob = null;
let outputName = "merged.pdf";
const stepper = initStepper();

mirrorButton(convertBtn, convertBtnMobile);

/* ---------- Render ---------- */
function renderList() {
  fileList.innerHTML = files
    .map(
      (entry, index) => `
    <article class="file-item" draggable="true" data-id="${entry.id}" aria-label="${escapeHtml(entry.file.name)}">
      <span class="drag-handle" aria-hidden="true" title="Drag to reorder">${ICONS.grip}</span>
      <span class="file-item__index" aria-hidden="true">${index + 1}</span>
      <span class="file-item__thumb" aria-hidden="true">${ICONS.pdf}</span>
      <div class="file-item__body">
        <p class="file-item__name" title="${escapeHtml(entry.file.name)}">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)}${entry.pages ? ` · ${entry.pages} pages` : ""}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" data-action="up" data-id="${entry.id}" aria-label="Move ${escapeHtml(entry.file.name)} up"${index === 0 ? " disabled" : ""}>${ICONS.up}</button>
        <button class="btn btn-icon" type="button" data-action="down" data-id="${entry.id}" aria-label="Move ${escapeHtml(entry.file.name)} down"${index === files.length - 1 ? " disabled" : ""}>${ICONS.down}</button>
        <button class="btn btn-icon" type="button" data-action="remove" data-id="${entry.id}" aria-label="Remove ${escapeHtml(entry.file.name)}">${ICONS.trash}</button>
      </div>
    </article>`
    )
    .join("");

  const ready = files.length >= 2;
  convertBtn.disabled = !ready;
  clearBtn.disabled = files.length === 0;

  if (files.length === 0) {
    setStatus(statusEl, "Add at least two PDF files to begin.");
    stepper.setStep(0);
  } else if (files.length === 1) {
    setStatus(statusEl, "Add one more PDF to merge. You can drag to reorder once you have several.");
    stepper.setStep(1);
  } else {
    setStatus(statusEl, `${files.length} PDFs ready. Drag or use the arrows to set the order.`);
    stepper.setStep(1);
  }

  wireDrag();
}

/* ---------- Drag to reorder ---------- */
function wireDrag() {
  let dragId = null;

  fileList.querySelectorAll(".file-item").forEach((item) => {
    item.addEventListener("dragstart", (event) => {
      dragId = item.dataset.id;
      item.classList.add("is-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", dragId);
      }
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("is-dragging");
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
    files.splice(index, 1);
  } else if (action === "up" && index > 0) {
    [files[index - 1], files[index]] = [files[index], files[index - 1]];
  } else if (action === "down" && index < files.length - 1) {
    [files[index + 1], files[index]] = [files[index], files[index + 1]];
  }
  renderList();
});

/* ---------- Add files ---------- */
let counter = 0;

async function addFiles(incoming) {
  const existing = new Set(files.map((f) => `${f.file.name}:${f.file.size}`));
  const added = [];

  for (const file of incoming) {
    const key = `${file.name}:${file.size}`;
    if (existing.has(key)) {
      showToast(`"${file.name}" is already in the list.`, "info");
      continue;
    }
    existing.add(key);
    added.push({ id: `f${counter++}`, file, pages: 0, bytes: null });
  }

  if (!added.length) return;
  files.push(...added);
  renderList();
  result.hidden = true;

  await Promise.all(
    added.map(async (entry) => {
      try {
        entry.bytes = await readAsArrayBuffer(entry.file);
        const doc = await PDFDocument.load(entry.bytes, { ignoreEncryption: true });
        entry.pages = doc.getPageCount();
      } catch (error) {
        entry.pages = 0;
        showToast(
          `"${entry.file.name}" could not be read. It may be corrupted or password-protected.`,
          "error"
        );
      }
    })
  );
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
  if (value === null) {
    progressBar.classList.add("is-indeterminate");
    progressBar.style.width = "";
    progressPct.textContent = "";
  } else {
    progressBar.classList.remove("is-indeterminate");
    progressBar.style.width = `${Math.round(value * 100)}%`;
    progressPct.textContent = `${Math.round(value * 100)}%`;
  }
  if (label) progressLabel.textContent = label;
}

async function convert() {
  if (files.length < 2) return;
  stepper.setStep(2);
  setBusy(convertBtn, true, "Merging…");
  setProgress(0, "Reading files…");

  try {
    const merged = await PDFDocument.create();
    let pageTotal = 0;

    for (let i = 0; i < files.length; i += 1) {
      const entry = files[i];
      setProgress(i / files.length, `Adding ${entry.file.name}…`);
      const bytes = entry.bytes || (await readAsArrayBuffer(entry.file));
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
      pageTotal += pages.length;
    }

    setProgress(0.92, "Saving merged document…");
    const outBytes = await merged.save({ useObjectStreams: true });
    outputBlob = new Blob([outBytes], { type: "application/pdf" });
    outputName = files[0].file.name.replace(/\.pdf$/i, "") + "-merged.pdf";

    setProgress(1, "Done");
    showResult(outputBlob.size, pageTotal);
    stepper.setStep(3);
    showToast("Merged successfully.", "success");
  } catch (error) {
    console.error(error);
    const protectedFile = files.find((f) => !f.pages);
    showToast(
      protectedFile
        ? `"${protectedFile.file.name}" could not be read. Remove its password or repair the file and try again.`
        : "Something went wrong while merging. One of the PDFs may be corrupted or protected.",
      "error"
    );
    stepper.setStep(1);
  } finally {
    setBusy(convertBtn, false);
    setTimeout(() => {
      progress.hidden = true;
      progressBar.style.width = "0%";
    }, 600);
  }
}

function showResult(size, pages) {
  result.hidden = false;
  resultTitle.textContent = "Your merged PDF is ready";
  resultMeta.textContent = `${pages} pages · ${formatBytes(size)} · ${files.length} files combined`;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  downloadBtn.focus();
}

convertBtn.addEventListener("click", convert);

downloadBtn.addEventListener("click", () => {
  if (outputBlob) downloadBlob(outputBlob, outputName);
});

/* ---------- Reset ---------- */
function resetAll() {
  files = [];
  outputBlob = null;
  result.hidden = true;
  renderList();
  stepper.setStep(0);
}

clearBtn.addEventListener("click", resetAll);
resetBtn.addEventListener("click", () => {
  resetAll();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) resetAll();
});

renderList();
