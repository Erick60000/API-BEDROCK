/**
 * script.js — orquestación de la interfaz BRArchive Compiler
 * No contiene lógica del formato en sí (eso vive en brarchive.js).
 */

const MAX_SIZE_MB = 200;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const STAGES = [
  { key: "analyze",   label: "Analizando addon..." },
  { key: "extract",   label: "Extrayendo archivos..." },
  { key: "bp",        label: "Analizando Behavior Pack..." },
  { key: "rp",         label: "Analizando Resource Pack..." },
  { key: "process",   label: "Procesando archivos..." },
  { key: "generate",  label: "Generando BRArchive..." },
  { key: "pack",      label: "Empaquetando addon..." },
  { key: "finalize",  label: "Finalizando..." },
];

const els = {
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("file-input"),
  fileInfo: document.getElementById("file-info"),
  fileName: document.getElementById("file-name"),
  fileSize: document.getElementById("file-size"),
  compileBtn: document.getElementById("compile-btn"),
  maxSizeLabel: document.getElementById("max-size-label"),

  screens: {
    upload: document.getElementById("screen-upload"),
    progress: document.getElementById("screen-progress"),
    result: document.getElementById("screen-result"),
  },

  progressBar: document.getElementById("progress-bar"),
  progressPercent: document.getElementById("progress-percent"),
  consoleLog: document.getElementById("console-log"),

  resultName: document.getElementById("result-name"),
  resultSize: document.getElementById("result-size"),
  downloadBtn: document.getElementById("download-btn"),
  resetBtn: document.getElementById("reset-btn"),
};

let selectedFile = null;
let outputBlob = null;

els.maxSizeLabel.textContent = `${MAX_SIZE_MB} MB`;

// ---------- selección de archivo ----------

els.dropzone.addEventListener("click", (e) => {
  // el <label for> ya abre el input; evitar doble disparo si se hace click en el botón interno
});

els.fileInput.addEventListener("change", () => {
  if (els.fileInput.files.length) handleFile(els.fileInput.files[0]);
});

["dragenter", "dragover"].forEach(evt =>
  els.dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    els.dropzone.classList.add("drag-over");
  })
);
["dragleave", "drop"].forEach(evt =>
  els.dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    els.dropzone.classList.remove("drag-over");
  })
);
els.dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  const isMcaddon = file.name.toLowerCase().endsWith(".mcaddon");
  if (!isMcaddon) {
    alert("El archivo debe ser un .mcaddon válido.");
    return;
  }
  if (file.size > MAX_SIZE_BYTES) {
    alert(`El archivo supera el tamaño máximo permitido (${MAX_SIZE_MB} MB).`);
    return;
  }

  selectedFile = file;
  els.fileName.textContent = file.name;
  els.fileSize.textContent = formatBytes(file.size);
  els.fileInfo.classList.remove("hidden");
  els.compileBtn.disabled = false;
}

els.compileBtn.addEventListener("click", () => {
  if (selectedFile) compile(selectedFile);
});

// ---------- compilación ----------

async function compile(file) {
  showScreen("progress");
  resetProgressUI();

  try {
    const zip = await JSZip.loadAsync(file);
    const packFiles = {}; // { path: Uint8Array }

    await runStage("analyze", async () => {
      // solo validación inicial, sin trabajo pesado
    });

    await runStage("extract", async () => {
      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        packFiles[path] = await entry.async("uint8array");
      }
    });

    let manifestBP = null, manifestRP = null;

    await runStage("bp", async () => {
      manifestBP = await findManifestOfType(packFiles, "behavior");
    });

    await runStage("rp", async () => {
      manifestRP = await findManifestOfType(packFiles, "resource");
    });

    await runStage("process", async () => {
      // punto donde, más adelante, se filtran los archivos que
      // de verdad necesitan pasar por BRArchive.injectBrarchiveFolders
    });

    await runStage("generate", async () => {
      // ✏️ CAMBIA ESTO: hoy BRArchive.injectBrarchiveFolders lanza un
      // error controlado porque el formato ERKBRAR1 aún no está
      // implementado (ver brarchive.js). Cuando esté listo, esta
      // llamada generará las carpetas __brarchive reales.
      BRArchive.injectBrarchiveFolders(packFiles);
    });

    let zipBlob;
    await runStage("pack", async () => {
      const outZip = new JSZip();
      for (const [path, data] of Object.entries(packFiles)) {
        outZip.file(path, data);
      }
      zipBlob = await outZip.generateAsync({ type: "blob" });
    });

    await runStage("finalize", async () => {
      outputBlob = zipBlob;
    });

    showResult(file.name, outputBlob);

  } catch (err) {
    console.error(err);
    markCurrentStageError(err.message || "Error desconocido");
  }
}

function findManifestOfType(packFiles, wantedType) {
  for (const [path, data] of Object.entries(packFiles)) {
    if (!path.endsWith("manifest.json")) continue;
    try {
      const manifest = JSON.parse(new TextDecoder().decode(data));
      if (BRArchive.detectPackType(manifest) === wantedType) return manifest;
    } catch { /* manifest inválido, se ignora */ }
  }
  return null;
}

// ---------- progreso / consola ----------

let stageEls = {};

function resetProgressUI() {
  els.progressBar.style.width = "0%";
  els.progressPercent.textContent = "0%";
  els.consoleLog.innerHTML = "";
  stageEls = {};

  STAGES.forEach(stage => {
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = `<span class="mark">·</span><span class="text">${stage.label}</span>`;
    els.consoleLog.appendChild(line);
    stageEls[stage.key] = line;
  });
}

async function runStage(key, work) {
  const idx = STAGES.findIndex(s => s.key === key);
  const line = stageEls[key];
  line.classList.add("active");
  line.querySelector(".mark").textContent = "▸";

  await work();
  // pequeña pausa para que el progreso se sienta real en archivos rápidos
  await new Promise(r => setTimeout(r, 120));

  line.classList.remove("active");
  line.classList.add("done");
  line.querySelector(".mark").textContent = "✓";

  const pct = Math.round(((idx + 1) / STAGES.length) * 100);
  els.progressBar.style.width = `${pct}%`;
  els.progressPercent.textContent = `${pct}%`;
  els.consoleLog.scrollTop = els.consoleLog.scrollHeight;
}

function markCurrentStageError(message) {
  const activeLine = els.consoleLog.querySelector(".line.active");
  if (activeLine) {
    activeLine.classList.remove("active");
    activeLine.querySelector(".mark").textContent = "✗";
    activeLine.style.color = "var(--danger)";
  }
  const errLine = document.createElement("div");
  errLine.className = "line";
  errLine.style.color = "var(--danger)";
  errLine.innerHTML = `<span class="mark">!</span><span class="text">${message}</span>`;
  els.consoleLog.appendChild(errLine);
}

// ---------- resultado ----------

function showResult(originalName, blob) {
  const outName = originalName.replace(/\.mcaddon$/i, "") + "_brarchive.mcaddon";
  els.resultName.textContent = outName;
  els.resultSize.textContent = formatBytes(blob.size);

  els.downloadBtn.onclick = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outName;
    a.click();
    URL.revokeObjectURL(url);
  };

  showScreen("result");
}

els.resetBtn.addEventListener("click", () => {
  selectedFile = null;
  outputBlob = null;
  els.fileInput.value = "";
  els.fileInfo.classList.add("hidden");
  els.compileBtn.disabled = true;
  showScreen("upload");
});

// ---------- utilidades ----------

function showScreen(name) {
  Object.values(els.screens).forEach(s => s.classList.remove("active"));
  els.screens[name].classList.add("active");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
