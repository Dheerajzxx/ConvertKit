/* ============================================================
   ConvertKit — json-to-csv.js
   ============================================================ */
import {
  setupDropzone,
  downloadBlob,
  showToast,
  setStatus,
  initStepper,
  mirrorButton,
  formatBytes,
  readAsText,
  escapeHtml,
  copyText,
  ICONS,
} from "../common.js";
import { flattenObject, previewTable } from "./csv-common.js";

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
const flattenInput = document.getElementById("flatten");
const delimiterSelect = document.getElementById("delimiter");
const noticeEl = document.getElementById("nested-notice");

const ACCEPT = [".json", "application/json", "text/plain"];
const MAX_SIZE_MB = 50;

let entry = null;
let csvText = "";
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

const DELIMITERS = { comma: ",", semicolon: ";", tab: "\t" };

function extractRecords(data) {
  if (Array.isArray(data)) return { records: data, nested: false };
  if (data && typeof data === "object") {
    for (const key of ["data", "items", "results", "records", "rows"]) {
      if (Array.isArray(data[key])) return { records: data[key], nested: false };
    }
    return { records: [data], nested: false };
  }
  return { records: [], error: "This JSON does not contain an object or array to convert." };
}

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a JSON file to begin.");
    stepper.setStep(0);
    return;
  }
  optionsPanel.hidden = false;
  convertBtn.disabled = false;
  fileList.innerHTML = `
    <article class="file-item">
      <span class="file-item__thumb" aria-hidden="true">${ICONS.code}</span>
      <div class="file-item__body">
        <p class="file-item__name">${escapeHtml(entry.file.name)}</p>
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.records.length} record${entry.records.length === 1 ? "" : "s"}</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    entry = null;
    renderFile();
  });
  previewTable(tablePreview, entry.records, entry.columns);
  setStatus(statusEl, `Parsed ${entry.records.length} records. Review and convert to CSV.`);
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
    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      showToast("This file is not valid JSON. Check for a missing comma or bracket.", "error");
      return;
    }
    const { records, nested, error } = extractRecords(data);
    if (error) {
      showToast(error, "error");
      return;
    }
    if (!records.length) {
      showToast("No records were found in this JSON.", "error");
      return;
    }

    const normalised = records.map((record) =>
      record && typeof record === "object" && !Array.isArray(record)
        ? record
        : { value: record }
    );
    const columns = [...new Set(normalised.flatMap((record) => Object.keys(record)))];

    entry = { file, records: normalised, columns, nested };
    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be read.`, "error");
  }
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
});

/* ---------- Convert ---------- */
function buildCsv() {
  const delimiter = DELIMITERS[delimiterSelect.value] || ",";
  const flatten = flattenInput.checked;
  let nestedFound = false;

  const rows = entry.records.map((record) => {
    if (!flatten) return record;
    const flat = flattenObject(record, "", {}, { nested: false });
    return flat;
  });

  if (flatten) {
    const check = entry.records.some((record) =>
      Object.values(record).some((v) => v && typeof v === "object")
    );
    nestedFound = check;
  }

  const columns = flatten
    ? [...new Set(rows.flatMap((row) => Object.keys(row)))]
    : entry.columns;

  const result = Papa.unparse(
    { fields: columns, data: rows.map((row) => columns.map((c) => row[c] ?? "")) },
    { delimiter }
  );
  return { csv: result, nestedFound };
}

function convert() {
  if (!entry) return;
  stepper.setStep(2);
  const { csv, nestedFound } = buildCsv();
  csvText = csv;

  output.textContent = csv.slice(0, 5000) + (csv.length > 5000 ? "\n…" : "");
  result.hidden = false;
  resultMeta.textContent = `${entry.records.length} rows · ${formatBytes(new Blob([csv]).size)}`;

  if (nestedFound) {
    noticeEl.hidden = false;
    noticeEl.textContent =
      "Nested objects were flattened using dot notation (for example address.city). Arrays were kept as JSON text.";
  } else {
    noticeEl.hidden = true;
  }

  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  document.getElementById("download-btn").focus();
  stepper.setStep(3);
  showToast("CSV generated.", "success");
}

convertBtn.addEventListener("click", convert);

document.getElementById("download-btn").addEventListener("click", () => {
  if (!entry) return;
  downloadBlob(
    new Blob([csvText], { type: "text/csv;charset=utf-8" }),
    entry.file.name.replace(/\.[^.]+$/, "") + ".csv"
  );
});

document.getElementById("copy-btn").addEventListener("click", () => {
  if (csvText) copyText(csvText);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  entry = null;
  csvText = "";
  result.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

delimiterSelect.addEventListener("change", () => {
  if (entry && !result.hidden) convert();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) document.getElementById("reset-btn").click();
});

renderFile();
