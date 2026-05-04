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

export function renderEntityList(container, entidades, onAddComponent, onRemoveComponent) {
    container.innerHTML = '';
    entidades.forEach((entidad, index) => {
        const componentes = entidad.componentes || [];
        const div = document.createElement('div');
        div.className = 'entidad';
        div.innerHTML = `
            <div class="entity-header">
                <h3>${entidad.nombre}</h3>
                <button type="button" class="secondary-button">Agregar componente</button>
            </div>
            <ul class="component-list">
                ${componentes.length === 0 ? '<li class="empty">Sin componentes</li>' : componentes.map((comp, compIndex) => `
                    <li>
                        <strong>${comp.name}</strong>
                        <span>${typeof comp.value === 'object' ? JSON.stringify(comp.value) : comp.value}</span>
                        <button type="button" class="remove-comp" data-index="${compIndex}">Eliminar</button>
                    </li>
                `).join('')}
            </ul>
        `;

        div.querySelector('button').addEventListener('click', () => onAddComponent(index));
        div.querySelectorAll('.remove-comp').forEach(button => {
            const componentIndex = Number(button.dataset.index);
            button.addEventListener('click', () => onRemoveComponent(index, componentIndex));
        });
        container.appendChild(div);
    });
}

export function renderBlockList(container, bloques, onAddComponent, onRemoveComponent) {
    container.innerHTML = '';
    bloques.forEach((bloque, index) => {
        const componentes = bloque.componentes || [];
        const div = document.createElement('div');
        div.className = 'bloque';
        div.innerHTML = `
            <div class="entity-header">
                <h3>${bloque.nombre}</h3>
                <button type="button" class="secondary-button">Agregar componente</button>
            </div>
            <ul class="component-list">
                ${componentes.length === 0 ? '<li class="empty">Sin componentes</li>' : componentes.map((comp, compIndex) => `
                    <li>
                        <strong>${comp.name}</strong>
                        <span>${typeof comp.value === 'object' ? JSON.stringify(comp.value) : comp.value}</span>
                        <button type="button" class="remove-comp" data-index="${compIndex}">Eliminar</button>
                    </li>
                `).join('')}
            </ul>
        `;

        div.querySelector('button').addEventListener('click', () => onAddComponent(index));
        div.querySelectorAll('.remove-comp').forEach(button => {
            const componentIndex = Number(button.dataset.index);
            button.addEventListener('click', () => onRemoveComponent(index, componentIndex));
        });
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
