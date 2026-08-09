const input = document.querySelector("#addon");
const compile = document.querySelector("#compile");
const info = document.querySelector("#fileInfo");
const progressBox = document.querySelector("#progressBox");
const status = document.querySelector("#status");
const bar = document.querySelector("#bar");
const percent = document.querySelector("#percent");
const result = document.querySelector("#result");

input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;
  info.textContent = `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  info.classList.remove("hidden");
  compile.disabled = !file.name.toLowerCase().endsWith(".mcaddon");
});

compile.addEventListener("click", async () => {
  const file = input.files[0];
  if (!file) return;

  compile.disabled = true;
  progressBox.classList.remove("hidden");
  result.classList.add("hidden");

  const stages = [
    ["Preparando archivo...", 10],
    ["Subiendo addon...", 25],
    ["Procesando estructura...", 50],
    ["Generando salida...", 75],
    ["Finalizando...", 95]
  ];

  let stage = 0;
  const timer = setInterval(() => {
    if (stage < stages.length) {
      status.textContent = stages[stage][0];
      bar.style.width = stages[stage][1] + "%";
      percent.textContent = stages[stage][1] + "%";
      stage++;
    }
  }, 700);

  const form = new FormData();
  form.append("addon", file);

  try {
    const response = await fetch("/api/compile", { method: "POST", body: form });
    clearInterval(timer);

    if (!response.ok) throw new Error((await response.json()).error || "Falló la compilación.");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.mcaddon$/i, "") + "_compiled.mcaddon";
    a.click();
    URL.revokeObjectURL(url);

    bar.style.width = "100%";
    percent.textContent = "100%";
    status.textContent = "Compilación completada";
    result.innerHTML = '<div class="success">✅ Compilación completada</div><p>El archivo resultante se ha preparado para descargar.</p>';
    result.classList.remove("hidden");
  } catch (error) {
    clearInterval(timer);
    status.textContent = "Error";
    result.textContent = "❌ " + error.message;
    result.classList.remove("hidden");
  } finally {
    compile.disabled = false;
  }
});
