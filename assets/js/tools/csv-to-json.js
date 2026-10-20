/* ============================================================
   ConvertKit — csv-to-json.js
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
  readAsText,
  escapeHtml,
  copyText,
  ICONS,
} from "../common.js";
import { previewTable } from "./csv-common.js";

const dropzone = document.getElementById("dropzone");
const fileList = document.getElementById("file-list");
const optionsPanel = document.getElementById("options-panel");
const convertBtn = document.getElementById("convert-btn");
const convertBtnMobile = document.getElementById("convert-btn-mobile");
const statusEl = document.getElementById("status");
const result = document.getElementById("result");
const resultMeta = document.getElementById("result-meta");
const output = document.getElementById("output");
const tablePreview = document.getElementById("table-preview");
const delimiterSelect = document.getElementById("delimiter");
const headerInput = document.getElementById("has-header");
const prettyInput = document.getElementById("pretty");

const ACCEPT = [".csv", ".tsv", "text/csv", "text/plain"];
const MAX_SIZE_MB = 50;

let entry = null;
let jsonText = "";
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

const DELIMITERS = { auto: "", comma: ",", tab: "\t", semicolon: ";" };

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a CSV file to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  convertBtn.disabled = false;
  fileList.innerHTML = `
    <article class="file-item">
      <span class="file-item__thumb" aria-hidden="true">${ICONS.table}</span>
      <div class="file-item__body">
        <p class="file-item__name">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.rows.length} rows · ${entry.columns.length} columns</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    entry = null;
    renderFile();
  });
  previewTable(tablePreview, entry.rows, entry.columns);
  setStatus(statusEl, `Parsed ${entry.rows.length} rows. Review and convert to JSON.`);
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
    const text = await readAsText(file);
    const parsed = parseCsvWithConfig(text);
    if (parsed.error) {
      showToast(parsed.error, "error");
      return;
    }
    entry = parsed;
    entry.file = file;
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be read.`, "error");
  }
}

function parseCsvWithConfig(text) {
  const delimiter = DELIMITERS[delimiterSelect.value];
  const hasHeader = headerInput.checked;
  const result = Papa.parse(text, {
    header: hasHeader,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    delimiter: delimiter || undefined,
    transformHeader: (h) => h.trim().replace(/^\ufeff/, ""),
  });

  if (result.errors && result.errors.length) {
    const first = result.errors[0];
    if (first.type === "Delimiter") {
      return { error: "Could not detect the delimiter. Choose one manually and try again." };
    }
  }

  const rows = result.data.filter((row) => row && Object.values(row).some((v) => v !== "" && v != null));
  if (!rows.length) return { error: "No data rows were found in this file." };

  const columns = hasHeader
    ? result.meta.fields || []
    : rows[0].map((_, i) => `column_${i + 1}`);

  return { rows, columns };
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
});

delimiterSelect.addEventListener("change", () => {
  if (entry) addFile([entry.file]);
});
headerInput.addEventListener("change", () => {
  if (entry) addFile([entry.file]);
});

/* ---------- Convert ---------- */
function convert() {
  if (!entry) return;
  stepper.setStep(2);
  const pretty = prettyInput.checked;
  jsonText = JSON.stringify(entry.rows, null, pretty ? 2 : 0);

  output.textContent = jsonText.slice(0, 5000) + (jsonText.length > 5000 ? "\n…" : "");
  result.hidden = false;
  resultMeta.textContent = `${entry.rows.length} objects · ${formatBytes(new Blob([jsonText]).size)}`;
  document.getElementById("download-btn").focus();
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  stepper.setStep(3);
  showToast("JSON generated.", "success");
}

convertBtn.addEventListener("click", convert);

document.getElementById("download-btn").addEventListener("click", () => {
  if (!entry) return;
  downloadBlob(
    new Blob([jsonText], { type: "application/json" }),
    entry.file.name.replace(/\.[^.]+$/, "") + ".json"
  );
});

document.getElementById("copy-btn").addEventListener("click", () => {
  if (jsonText) copyText(jsonText);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  entry = null;
  jsonText = "";
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !result.hidden) return;
  if (event.key === "Escape" && !result.hidden) document.getElementById("reset-btn").click();
});

renderFile();
