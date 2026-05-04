import { createAddon, generateEntityJson, generateBlockJson, setNestedValue, addFilesToZip, loadAddonsFromStorage, saveCurrentAddon } from './addonManager.js';
import { renderFileTree, renderEntityList, renderBlockList, renderTextureList, renderAddonList, showAlert } from './ui.js';
import { downloadBlob, generateUUID } from './utils.js';

let currentAddon = null;
let currentFile = null;

function init() {
    const formAddon = document.getElementById('form-addon');
    const listaAddons = document.getElementById('lista-addons');
    const agregarEntidadBtn = document.getElementById('agregar-entidad');
    const listaEntidades = document.getElementById('lista-entidades');
    const agregarBloqueBtn = document.getElementById('agregar-bloque');
    const listaBloques = document.getElementById('lista-bloques');
    const subirTextura = document.getElementById('subir-textura');
    const listaTexturas = document.getElementById('lista-texturas');
    const descargarBtn = document.getElementById('descargar-addon');
    const fileTree = document.getElementById('file-tree');
    const editorContent = document.getElementById('editor-content');
    const saveFileBtn = document.getElementById('save-file');

    renderAddonList(listaAddons, loadAddonsFromStorage(), index => {
        currentAddon = loadAddonsFromStorage()[index];
        updateEditorState();
        showAlert('Addon cargado. Puedes modificarlo.');
    });

    formAddon.addEventListener('submit', event => {
        event.preventDefault();
        const nombre = document.getElementById('nombre-addon').value.trim();
        const version = document.getElementById('version-addon').value.trim();
        const descripcion = document.getElementById('descripcion-addon').value.trim();
        const uuid = document.getElementById('uuid-addon').value.trim() || generateUUID();

        currentAddon = createAddon({ nombre, version, descripcion, uuid });
        updateEditorState();
        showAlert('Addon creado. Ahora puedes agregar entidades, bloques y texturas.');
    });

    saveFileBtn.addEventListener('click', () => {
        if (!currentAddon || !currentFile) {
            showAlert('Selecciona un archivo antes de guardar.');
            return;
        }

        setNestedValue(currentAddon.files, currentFile.split('/'), editorContent.value);
        updateEditorState();
    });

    agregarEntidadBtn.addEventListener('click', () => {
        if (!ensureAddon()) return;
        const nombreEntidad = prompt('Nombre de la entidad:');
        if (!nombreEntidad) return;

        currentAddon.entidades.push({ nombre: nombreEntidad, componentes: [] });
        currentAddon.files.behavior_packs.entities[`${nombreEntidad}.json`] = generateEntityJson(nombreEntidad, []);
        updateEditorState();
    });

    agregarBloqueBtn.addEventListener('click', () => {
        if (!ensureAddon()) return;
        const nombreBloque = prompt('Nombre del bloque:');
        if (!nombreBloque) return;

        currentAddon.bloques.push({ nombre: nombreBloque });
        currentAddon.files.behavior_packs.blocks[`${nombreBloque}.json`] = generateBlockJson(nombreBloque);
        updateEditorState();
    });

    subirTextura.addEventListener('change', event => {
        if (!ensureAddon()) return;
        const files = Array.from(event.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                currentAddon.texturas.push({ nombre: file.name, data: e.target.result });
                currentAddon.files.resource_packs.textures[file.name] = e.target.result;
                updateEditorState();
            };
            reader.readAsDataURL(file);
        });
    });

    descargarBtn.addEventListener('click', () => {
        if (!ensureAddon()) return;
        saveCurrentAddon(currentAddon);
        renderAddonList(listaAddons, loadAddonsFromStorage(), index => {
            currentAddon = loadAddonsFromStorage()[index];
            updateEditorState();
            showAlert('Addon cargado. Puedes modificarlo.');
        });

        const zip = new JSZip();
        addFilesToZip(zip, currentAddon.files);
        zip.generateAsync({ type: 'blob' }).then(content => {
            downloadBlob(`${currentAddon.nombre}.zip`, content);
        });
    });

    function ensureAddon() {
        if (!currentAddon) {
            showAlert('Primero crea un addon.');
            return false;
        }
        return true;
    }

    function updateEditorState() {
        renderFileTree(fileTree, currentAddon ? currentAddon.files : {}, path => {
            currentFile = path;
            const fileContent = getFileContent(currentAddon.files, path.split('/'));
            editorContent.value = fileContent || '';
        });
        renderEntityList(listaEntidades, currentAddon ? currentAddon.entidades : [], addComponentToEntity);
        renderBlockList(listaBloques, currentAddon ? currentAddon.bloques : []);
        renderTextureList(listaTexturas, currentAddon ? currentAddon.texturas : []);
    }

    function getFileContent(obj, keys) {
        return keys.reduce((current, key) => current && current[key], obj);
    }

    function addComponentToEntity(index) {
        const componente = prompt('Nombre del componente (ej: minecraft:health):');
        if (!componente) return;
        currentAddon.entidades[index].componentes.push(componente);
        currentAddon.files.behavior_packs.entities[`${currentAddon.entidades[index].nombre}.json`] = generateEntityJson(
            currentAddon.entidades[index].nombre,
            currentAddon.entidades[index].componentes
        );
        updateEditorState();
    }
}

document.addEventListener('DOMContentLoaded', init);
