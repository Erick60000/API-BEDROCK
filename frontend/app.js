const $=s=>document.querySelector(s);
const input=$("#addon"), fileBox=$("#file"), go=$("#go"), progress=$("#progress");
const stage=$("#stage"), pct=$("#pct"), fill=$("#fill"), done=$("#done"), doneText=$("#doneText");
const download=$("#download"), again=$("#again"), error=$("#error");

let selected=null;

input.onchange=()=>{
  selected=input.files[0]||null;
  if(!selected)return;
  if(!selected.name.toLowerCase().endsWith(".mcaddon")){
    showError("Selecciona un archivo .mcaddon válido."); return;
  }
  fileBox.textContent=`📦 ${selected.name}  •  ${formatSize(selected.size)}`;
  fileBox.classList.remove("hidden");
  error.classList.add("hidden");
  go.disabled=false;
};

go.onclick=async()=>{
  if(!selected)return;
  go.disabled=true; done.classList.add("hidden"); error.classList.add("hidden"); progress.classList.remove("hidden");
  const fake=[
    ["Preparando archivo…",8],
    ["Subiendo addon…",22],
    ["Extrayendo packs…",40],
    ["Analizando estructura…",55],
    ["Generando BRArchive…",75],
    ["Empaquetando MCAddon…",90]
  ];
  let i=0;
  const timer=setInterval(()=>{
    if(i<fake.length){stage.textContent=fake[i][0]; setProgress(fake[i][1]); i++;}
  },650);

  try{
    const form=new FormData(); form.append("addon",selected);
    const response=await fetch("/api/compile",{method:"POST",body:form});
    clearInterval(timer);
    if(!response.ok)throw new Error((await response.json()).error||"La compilación falló.");
    const blob=await response.blob();
    const url=URL.createObjectURL(blob);
    download.href=url;
    download.download=selected.name.replace(/\.mcaddon$/i,"")+"_compiled.mcaddon";
    setProgress(100); stage.textContent="Compilación completada";
    doneText.textContent=`${download.download} • ${formatSize(blob.size)}`;
    done.classList.remove("hidden");
  }catch(e){
    clearInterval(timer);
    showError("❌ "+e.message);
  }finally{go.disabled=false;}
};

again.onclick=()=>{input.value="";selected=null;fileBox.classList.add("hidden");done.classList.add("hidden");progress.classList.add("hidden");error.classList.add("hidden");go.disabled=true;setProgress(0);};

function setProgress(n){fill.style.width=n+"%";pct.textContent=n+"%";}
function showError(t){error.textContent=t;error.classList.remove("hidden");}
function formatSize(n){return n<1024*1024?(n/1024).toFixed(1)+" KB":(n/1024/1024).toFixed(2)+" MB";}