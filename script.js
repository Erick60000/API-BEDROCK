document.addEventListener('DOMContentLoaded', function() {
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

    let currentAddon = null;
    let currentFile = null;

    // Cargar addons guardados
    loadAddons();

    formAddon.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre-addon').value;
        const version = document.getElementById('version-addon').value;
        const descripcion = document.getElementById('descripcion-addon').value;
        const uuid = document.getElementById('uuid-addon').value || generateUUID();

        currentAddon = {
            nombre,
            version,
            descripcion,
            uuid,
            files: {
                'manifest.json': generateManifest(nombre, version, descripcion, uuid),
                'behavior_packs/entities/': {},
                'behavior_packs/blocks/': {},
                'resource_packs/textures/': {}
            },
            entidades: [],
            bloques: [],
            texturas: []
        };

        renderFileTree();
        alert('Addon creado. Ahora puedes agregar entidades, bloques y texturas.');
    });

    function generateManifest(name, version, description, uuid) {
        return JSON.stringify({
            format_version: 2,
            header: {
                description: description,
                name: name,
                uuid: uuid,
                version: version.split('.').map(Number),
                min_engine_version: [1, 16, 0]
            },
            modules: [
                {
                    description: description,
                    type: "data",
                    uuid: generateUUID(),
                    version: version.split('.').map(Number)
                },
                {
                    description: description,
                    type: "resources",
                    uuid: generateUUID(),
                    version: version.split('.').map(Number)
                }
            ]
        }, null, 2);
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function renderFileTree() {
        fileTree.innerHTML = '';
        renderFolder('', currentAddon.files);
    }

    function renderFolder(path, folder) {
        const ul = document.createElement('ul');
        for (const key in folder) {
            const li = document.createElement('li');
            const fullPath = path ? `${path}/${key}` : key;
            if (typeof folder[key] === 'object' && !Array.isArray(folder[key])) {
                li.textContent = `📁 ${key}`;
                li.addEventListener('click', () => {
                    // Toggle subfolder
                    const subUl = li.querySelector('ul');
                    if (subUl) {
                        subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                    } else {
                        renderFolder(fullPath, folder[key]);
                        li.appendChild(ul);
                    }
                });
            } else {
                li.textContent = `📄 ${key}`;
                li.addEventListener('click', () => {
                    currentFile = fullPath;
                    editorContent.value = folder[key];
                });
            }
            ul.appendChild(li);
        }
        fileTree.appendChild(ul);
    }

    saveFileBtn.addEventListener('click', function() {
        if (currentFile) {
            setNestedValue(currentAddon.files, currentFile.split('/'), editorContent.value);
            renderFileTree();
        }
    });

    function setNestedValue(obj, keys, value) {
        const lastKey = keys.pop();
        const lastObj = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
        lastObj[lastKey] = value;
    }

    agregarEntidadBtn.addEventListener('click', function() {
        if (!currentAddon) {
            alert('Primero crea un addon.');
            return;
        }
        const nombreEntidad = prompt('Nombre de la entidad:');
        if (nombreEntidad) {
            const entidad = {
                nombre: nombreEntidad,
                componentes: []
            };
            currentAddon.entidades.push(entidad);
            const entityJson = generateEntityJson(nombreEntidad, []);
            currentAddon.files[`behavior_pack/entities/${nombreEntidad}.json`] = entityJson;
            renderFileTree();
            renderEntidades();
        }
    });

    function generateEntityJson(name, components) {
        return JSON.stringify({
            format_version: "1.16.0",
            "minecraft:entity": {
                description: {
                    identifier: `addon:${name}`,
                    is_spawnable: true,
                    is_summonable: true,
                    is_experimental: false
                },
                components: components.reduce((acc, comp) => {
                    acc[comp] = {};
                    return acc;
                }, {})
            }
        }, null, 2);
    }

    function renderEntidades() {
        listaEntidades.innerHTML = '';
        currentAddon.entidades.forEach((entidad, index) => {
            const div = document.createElement('div');
            div.className = 'entidad';
            div.innerHTML = `
                <h3>${entidad.nombre}</h3>
                <button onclick="agregarComponente(${index})">Agregar Componente</button>
                <ul>${entidad.componentes.map(comp => `<li>${comp}</li>`).join('')}</ul>
            `;
            listaEntidades.appendChild(div);
        });
    }

    window.agregarComponente = function(index) {
        const componente = prompt('Nombre del componente (ej: minecraft:health):');
        if (componente) {
            currentAddon.entidades[index].componentes.push(componente);
            const entityJson = generateEntityJson(currentAddon.entidades[index].nombre, currentAddon.entidades[index].componentes);
            currentAddon.files[`behavior_pack/entities/${currentAddon.entidades[index].nombre}.json`] = entityJson;
            renderFileTree();
            renderEntidades();
        }
    };

    agregarBloqueBtn.addEventListener('click', function() {
        if (!currentAddon) {
            alert('Primero crea un addon.');
            return;
        }
        const nombreBloque = prompt('Nombre del bloque:');
        if (nombreBloque) {
            const bloque = {
                nombre: nombreBloque,
                propiedades: {}
            };
            currentAddon.bloques.push(bloque);
            const blockJson = generateBlockJson(nombreBloque);
            currentAddon.files[`behavior_pack/blocks/${nombreBloque}.json`] = blockJson;
            renderFileTree();
            renderBloques();
        }
    });

    function generateBlockJson(name) {
        return JSON.stringify({
            format_version: "1.16.0",
            "minecraft:block": {
                description: {
                    identifier: `addon:${name}`
                },
                components: {
                    "minecraft:loot": "loot_tables/blocks/${name}.json",
                    "minecraft:destroy_time": 2.0
                }
            }
        }, null, 2);
    }

    function renderBloques() {
        listaBloques.innerHTML = '';
        currentAddon.bloques.forEach(bloque => {
            const div = document.createElement('div');
            div.className = 'bloque';
            div.innerHTML = `<h3>${bloque.nombre}</h3>`;
            listaBloques.appendChild(div);
        });
    }

    subirTextura.addEventListener('change', function(e) {
        if (!currentAddon) {
            alert('Primero crea un addon.');
            return;
        }
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentAddon.texturas.push({
                    nombre: file.name,
                    data: event.target.result
                });
                currentAddon.files[`resource_pack/textures/${file.name}`] = event.target.result;
                renderFileTree();
                renderTexturas();
            };
            reader.readAsDataURL(file);
        }
    });

    function renderTexturas() {
        listaTexturas.innerHTML = '';
        currentAddon.texturas.forEach(textura => {
            const div = document.createElement('div');
            div.className = 'textura';
            div.innerHTML = `
                <h3>${textura.nombre}</h3>
                <img src="${textura.data}" width="100">
            `;
            listaTexturas.appendChild(div);
        });
    }

    descargarBtn.addEventListener('click', function() {
        if (!currentAddon) {
            alert('No hay addon para descargar.');
            return;
        }
        // Guardar en localStorage
        const addons = JSON.parse(localStorage.getItem('addons') || '[]');
        addons.push(currentAddon);
        localStorage.setItem('addons', JSON.stringify(addons));
        loadAddons();

        // Descargar como ZIP
        const zip = new JSZip();
        addFilesToZip(zip, currentAddon.files, '');
        zip.generateAsync({type: 'blob'}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${currentAddon.nombre}.zip`;
            link.click();
        });
    });

    function addFilesToZip(zip, files, path) {
        for (const key in files) {
            const fullPath = path ? `${path}/${key}` : key;
            if (typeof files[key] === 'object' && !Array.isArray(files[key])) {
                addFilesToZip(zip, files[key], fullPath);
            } else {
                zip.file(fullPath, files[key]);
            }
        }
    }

    function loadAddons() {
        const addons = JSON.parse(localStorage.getItem('addons') || '[]');
        listaAddons.innerHTML = '';
        addons.forEach((addon, index) => {
            const li = document.createElement('li');
            li.textContent = `${addon.nombre} v${addon.version}`;
            li.addEventListener('click', function() {
                currentAddon = addon;
                renderFileTree();
                renderEntidades();
                renderBloques();
                renderTexturas();
                alert('Addon cargado. Puedes modificarlo.');
            });
            listaAddons.appendChild(li);
        });
    }
});