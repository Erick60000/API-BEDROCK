export function renderFileTree(container, files, onSelectFile) {
    container.innerHTML = '';
    container.appendChild(createFolderList(files, '', onSelectFile));
}

function createFolderList(folder, path, onSelectFile) {
    const ul = document.createElement('ul');
    Object.keys(folder).sort().forEach(key => {
        const value = folder[key];
        const fullPath = path ? `${path}/${key}` : key;
        const li = document.createElement('li');

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const folderLabel = document.createElement('div');
            folderLabel.className = 'folder-label';
            folderLabel.textContent = `📁 ${key}`;

            const nested = createFolderList(value, fullPath, onSelectFile);
            nested.style.display = 'none';

            folderLabel.addEventListener('click', () => {
                nested.style.display = nested.style.display === 'none' ? 'block' : 'none';
            });

            li.append(folderLabel, nested);
        } else {
            const fileLabel = document.createElement('div');
            fileLabel.className = 'file-label';
            fileLabel.textContent = `📄 ${key}`;
            fileLabel.addEventListener('click', () => onSelectFile(fullPath));
            li.appendChild(fileLabel);
        }

        ul.appendChild(li);
    });
    return ul;
}

export function renderEntityList(container, entidades, onAddComponent) {
    container.innerHTML = '';
    entidades.forEach((entidad, index) => {
        const div = document.createElement('div');
        div.className = 'entidad';
        div.innerHTML = `
            <h3>${entidad.nombre}</h3>
            <button type="button">Agregar Componente</button>
            <ul>${entidad.componentes.map(comp => `<li>${comp}</li>`).join('')}</ul>
        `;
        div.querySelector('button').addEventListener('click', () => onAddComponent(index));
        container.appendChild(div);
    });
}

export function renderBlockList(container, bloques) {
    container.innerHTML = '';
    bloques.forEach(bloque => {
        const div = document.createElement('div');
        div.className = 'bloque';
        div.innerHTML = `<h3>${bloque.nombre}</h3>`;
        container.appendChild(div);
    });
}

export function renderTextureList(container, texturas) {
    container.innerHTML = '';
    texturas.forEach(textura => {
        const div = document.createElement('div');
        div.className = 'textura';
        div.innerHTML = `
            <h3>${textura.nombre}</h3>
            <img src="${textura.data}" width="100" alt="${textura.nombre}">
        `;
        container.appendChild(div);
    });
}

export function renderAddonList(container, addons, onLoadAddon) {
    container.innerHTML = '';
    addons.forEach((addon, index) => {
        const li = document.createElement('li');
        li.textContent = `${addon.nombre} v${addon.version}`;
        li.addEventListener('click', () => onLoadAddon(index));
        container.appendChild(li);
    });
}

export function showAlert(message) {
    alert(message);
}
