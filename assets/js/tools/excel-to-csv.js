/* ============================================================
   ConvertKit — excel-to-csv.js
   Read .xlsx / .xls / .csv and export any sheet as CSV or JSON
   ============================================================ */
import {
  setupDropzone,
  downloadBlob,
  showToast,
  setStatus,
  initStepper,
  mirrorButton,
  formatBytes,
  readAsArrayBuffer,
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
const sheetField = document.getElementById("sheet-field");
const sheetSelect = document.getElementById("sheet-select");
const formatInputs = [...document.querySelectorAll('input[name="outformat"]')];
const delimiterSelect = document.getElementById("delimiter");

const ACCEPT = [".xlsx", ".xls", ".csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"];
const MAX_SIZE_MB = 50;
const DELIMITERS = { comma: ",", semicolon: ";", tab: "\t" };

let workbook = null;
let entry = null;
let outputText = "";
const stepper = initStepper();
mirrorButton(convertBtn, convertBtnMobile);

function currentFormat() {
  return formatInputs.find((input) => input.checked)?.value || "csv";
}

function rowsFromSheet(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });
  if (rows.length < 2) return { header: rows[0] || [], data: [] };
  const header = rows[0].map((h, i) => (String(h || "").trim() || `column_${i + 1}`));
  const data = rows.slice(1).map((row) => {
    const record = {};
    header.forEach((key, i) => {
      record[key] = row[i] == null ? "" : row[i];
    });
    return record;
  });
  return { header, data };
}

function renderFile() {
  if (!entry) {
    fileList.innerHTML = "";
    optionsPanel.hidden = true;
    convertBtn.disabled = true;
    setStatus(statusEl, "Add a spreadsheet to begin.");
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
        <p class="file-item__meta">${formatBytes(entry.file.size)} · ${entry.sheetNames.length} sheet${entry.sheetNames.length === 1 ? "" : "s"} · ${entry.data.length} rows</p>
      </div>
      <div class="file-item__actions">
        <button class="btn btn-icon" type="button" id="remove-file" aria-label="Remove file">${ICONS.trash}</button>
      </div>
    </article>`;
  document.getElementById("remove-file").addEventListener("click", () => {
    entry = null;
    workbook = null;
    renderFile();
  });
  previewTable(tablePreview, entry.data, entry.header);
  setStatus(statusEl, `Sheet "${entry.sheetNames[entry.activeSheet]}" has ${entry.data.length} rows. Choose an output format.`);
  stepper.setStep(1);
}

fileList.addEventListener("click", (event) => {
  if (!event.target.closest("#remove-file")) return;
  entry = null;
  workbook = null;
  renderFile();
});

function loadSheet(index) {
  const name = workbook.SheetNames[index];
  const { header, data } = rowsFromSheet(workbook.Sheets[name]);
  entry.activeSheet = index;
  entry.header = header;
  entry.data = data;
  entry.sheetNames = workbook.SheetNames;
}

async function addFile(files) {
  const file = files[0];
  try {
    let parsed;
    if (/\.csv$/i.test(file.name)) {
      const text = await readAsText(file);
      const csv = XLSX.read(text, { type: "string" });
      parsed = csv;
    } else {
      const buffer = await readAsArrayBuffer(file);
      parsed = XLSX.read(buffer, { type: "array", cellDates: true });
    }

    workbook = parsed;
    const first = workbook.SheetNames[0];
    const { header, data } = rowsFromSheet(workbook.Sheets[first]);

    entry = {
      file,
      sheetNames: workbook.SheetNames,
      activeSheet: 0,
      header,
      data,
    };

    if (workbook.SheetNames.length > 1) {
      sheetField.hidden = false;
      sheetSelect.innerHTML = workbook.SheetNames.map(
        (name, i) => `<option value="${i}">${escapeHtml(name)}</option>`
      ).join("");
    } else {
      sheetField.hidden = true;
    }

    result.hidden = true;
    renderFile();
  } catch (error) {
    console.error(error);
    showToast(`"${file.name}" could not be read as a spreadsheet.`, "error");
  }
}

setupDropzone(dropzone, {
  accept: ACCEPT,
  multiple: false,
  maxSizeMB: MAX_SIZE_MB,
  onFiles: addFile,
});

sheetSelect.addEventListener("change", () => {
  if (!workbook) return;
  loadSheet(Number(sheetSelect.value));
  result.hidden = true;
  renderFile();
});

/* ---------- Convert ---------- */
function convert() {
  if (!entry) return;
  stepper.setStep(2);
  const format = currentFormat();
  const base = entry.file.name.replace(/\.[^.]+$/, "");
  const sheetName = entry.sheetNames[entry.activeSheet];

  if (format === "csv") {
    const delimiter = DELIMITERS[delimiterSelect.value] || ",";
    const rows = entry.data.map((record) => entry.header.map((key) => record[key] ?? ""));
    outputText = Papa.unparse({ fields: entry.header, data: rows }, { delimiter });
    output.textContent = outputText.slice(0, 5000) + (outputText.length > 5000 ? "\n…" : "");
    resultMeta.textContent = `CSV · ${entry.data.length} rows · ${formatBytes(new Blob([outputText]).size)}`;
  } else {
    const records = entry.data.map((record) => {
      const flat = flattenObject(record, "", {}, { nested: false });
      return flat;
    });
    outputText = JSON.stringify(records, null, 2);
    output.textContent = outputText.slice(0, 5000) + (outputText.length > 5000 ? "\n…" : "");
    resultMeta.textContent = `JSON · ${records.length} objects · ${formatBytes(new Blob([outputText]).size)}`;
  }

  entry.outputName = `${base}-${sheetName.replace(/\s+/g, "-")}.${format}`;
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  document.getElementById("download-btn").focus();
  stepper.setStep(3);
  showToast("Conversion complete.", "success");
}

convertBtn.addEventListener("click", convert);

document.getElementById("download-btn").addEventListener("click", () => {
  if (!outputText) return;
  const type = currentFormat() === "csv" ? "text/csv;charset=utf-8" : "application/json";
  downloadBlob(new Blob([outputText], { type }), entry.outputName);
});

document.getElementById("copy-btn").addEventListener("click", () => {
  if (outputText) copyText(outputText);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  workbook = null;
  entry = null;
  outputText = "";
  result.hidden = true;
  sheetField.hidden = true;
  renderFile();
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !result.hidden) document.getElementById("reset-btn").click();
});

renderFile();
