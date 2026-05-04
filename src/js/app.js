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
    const engineVersionSelect = document.getElementById('engine-version');
    const statusAddon = document.getElementById('status-addon');
    const statusFiles = document.getElementById('status-files');
    const currentAddonName = document.getElementById('current-addon-name');
    const currentAddonVersion = document.getElementById('current-addon-version');
    const currentAddonEngineVersion = document.getElementById('current-addon-engine-version');
    const currentAddonUuid = document.getElementById('current-addon-uuid');
    const currentAddonEntityCount = document.getElementById('current-addon-entity-count');
    const currentAddonBlockCount = document.getElementById('current-addon-block-count');
    const currentAddonTextureCount = document.getElementById('current-addon-texture-count');
    const addonDescription = document.getElementById('addon-description');
    const folderList = document.getElementById('folder-list');

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
        const engineVersion = engineVersionSelect.value;

        currentAddon = createAddon({ nombre, version, descripcion, uuid, engineVersion });
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

        currentAddon.bloques.push({ nombre: nombreBloque, componentes: [] });
        currentAddon.files.behavior_packs.blocks[`${nombreBloque}.json`] = generateBlockJson(nombreBloque, []);
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
        renderEntityList(listaEntidades, currentAddon ? currentAddon.entidades : [], addComponentToEntity, removeEntityComponent);
        renderBlockList(listaBloques, currentAddon ? currentAddon.bloques : [], addComponentToBlock, removeBlockComponent);
        renderTextureList(listaTexturas, currentAddon ? currentAddon.texturas : []);
        updateStatus();
        updateAddonSummary();
    }

    function getFileContent(obj, keys) {
        return keys.reduce((current, key) => current && current[key], obj);
    }

    function updateAddonSummary() {
        if (!currentAddon) {
            currentAddonName.textContent = 'Ninguno';
            currentAddonVersion.textContent = '-';
            currentAddonUuid.textContent = '-';
            currentAddonEntityCount.textContent = '0';
            currentAddonBlockCount.textContent = '0';
            currentAddonTextureCount.textContent = '0';
            addonDescription.textContent = 'Crea un addon para ver sus detalles aquí.';
            folderList.innerHTML = '<li>No hay addon activo.</li>';
            return;
        }

        currentAddonName.textContent = currentAddon.nombre;
        currentAddonVersion.textContent = currentAddon.version;
        currentAddonUuid.textContent = currentAddon.uuid;
        currentAddonEngineVersion.textContent = currentAddon.engineVersion || '1.26.30';
        currentAddonEntityCount.textContent = currentAddon.entidades.length;
        currentAddonBlockCount.textContent = currentAddon.bloques.length;
        currentAddonTextureCount.textContent = currentAddon.texturas.length;
        addonDescription.textContent = currentAddon.descripcion || 'Sin descripción.';
        renderFolderListSummary(currentAddon.files);
    }

    function renderFolderListSummary(files) {
        const elements = [];

        function walk(node, parentPath = '') {
            Object.keys(node).forEach(key => {
                const value = node[key];
                const fullPath = parentPath ? `${parentPath}/${key}` : key;

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    elements.push(`<li><strong>${fullPath}</strong></li>`);
                    walk(value, fullPath);
                } else {
                    elements.push(`<li>${fullPath}</li>`);
                }
            });
        }

        walk(files);
        folderList.innerHTML = elements.length ? elements.join('') : '<li>No hay archivos.</li>';
    }

    function updateStatus() {
        statusAddon.textContent = currentAddon ? currentAddon.nombre : 'No';
        statusFiles.textContent = currentAddon ? countFiles(currentAddon.files) : '0';
    }

    function countFiles(node) {
        if (!node || typeof node !== 'object') return 0;
        return Object.entries(node).reduce((count, [key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return count + countFiles(value);
            }
            return count + 1;
        }, 0);
    }

    function addComponentToEntity(index) {
        const componente = prompt('Nombre del componente (ej: minecraft:health):');
        if (!componente) return;
        const valor = prompt('Valor JSON del componente (por ejemplo {"max":20}) o deja vacío para {}');
        let parsedValue = {};
        if (valor) {
            try {
                parsedValue = JSON.parse(valor);
            } catch (err) {
                parsedValue = valor;
            }
        }

        currentAddon.entidades[index].componentes.push({ name: componente, value: parsedValue });
        currentAddon.files.behavior_packs.entities[`${currentAddon.entidades[index].nombre}.json`] = generateEntityJson(
            currentAddon.entidades[index].nombre,
            currentAddon.entidades[index].componentes
        );
        updateEditorState();
    }

    function removeEntityComponent(index, componentIndex) {
        currentAddon.entidades[index].componentes.splice(componentIndex, 1);
        currentAddon.files.behavior_packs.entities[`${currentAddon.entidades[index].nombre}.json`] = generateEntityJson(
            currentAddon.entidades[index].nombre,
            currentAddon.entidades[index].componentes
        );
        updateEditorState();
    }

    function addComponentToBlock(index) {
        const componente = prompt('Nombre del componente (ej: minecraft:destroy_time):');
        if (!componente) return;
        const valor = prompt('Valor JSON del componente (por ejemplo 2.0 o {"enabled":true}) o deja vacío para {}');
        let parsedValue = {};
        if (valor) {
            try {
                parsedValue = JSON.parse(valor);
            } catch (err) {
                parsedValue = valor;
            }
        }

        currentAddon.bloques[index].componentes.push({ name: componente, value: parsedValue });
        currentAddon.files.behavior_packs.blocks[`${currentAddon.bloques[index].nombre}.json`] = generateBlockJson(
            currentAddon.bloques[index].nombre,
            currentAddon.bloques[index].componentes
        );
        updateEditorState();
    }

    function removeBlockComponent(index, componentIndex) {
        currentAddon.bloques[index].componentes.splice(componentIndex, 1);
        currentAddon.files.behavior_packs.blocks[`${currentAddon.bloques[index].nombre}.json`] = generateBlockJson(
            currentAddon.bloques[index].nombre,
            currentAddon.bloques[index].componentes
        );
        updateEditorState();
    }
}

document.addEventListener('DOMContentLoaded', init);
