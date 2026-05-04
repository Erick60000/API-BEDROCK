import { generateUUID, safeJson } from './utils.js';

function normalizeVersion(version = '1.26.30') {
    const parts = version.split('.').map(part => Number(part.trim()) || 0);
    return [parts[0] || 1, parts[1] || 26, parts[2] || 30].slice(0, 3);
}

export function createAddon({ nombre, version, descripcion, uuid, engineVersion }) {
    const addonUuid = uuid || generateUUID();
    const engineVersionArray = normalizeVersion(engineVersion);

    return {
        nombre,
        version,
        descripcion,
        uuid: addonUuid,
        engineVersion: engineVersionArray.join('.'),
        files: {
            'manifest.json': generateManifest(nombre, version, descripcion, addonUuid, engineVersionArray),
            behavior_packs: {
                entities: {},
                blocks: {}
            },
            resource_packs: {
                textures: {}
            }
        },
        entidades: [],
        bloques: [],
        texturas: []
    };
}

export function generateManifest(name, version, description, uuid, engineVersionArray = [1, 26, 30]) {
    return safeJson({
        format_version: 2,
        header: {
            description: description,
            name: name,
            uuid: uuid,
            version: normalizeVersion(version),
            min_engine_version: engineVersionArray
        },
        modules: [
            {
                description: description,
                type: 'data',
                uuid: generateUUID(),
                version: normalizeVersion(version)
            },
            {
                description: description,
                type: 'resources',
                uuid: generateUUID(),
                version: normalizeVersion(version)
            }
        ]
    });
}

export function generateEntityJson(name, components = []) {
    return safeJson({
        format_version: '1.16.0',
        'minecraft:entity': {
            description: {
                identifier: `addon:${name}`,
                is_spawnable: true,
                is_summonable: true,
                is_experimental: false
            },
            components: components.reduce((acc, comp) => {
                acc[comp.name] = comp.value !== undefined ? comp.value : {};
                return acc;
            }, {})
        }
    });
}

export function generateBlockJson(name, components = []) {
    const componentData = components.reduce((acc, comp) => {
        acc[comp.name] = comp.value !== undefined ? comp.value : {};
        return acc;
    }, {
        'minecraft:loot': `loot_tables/blocks/${name}.json`,
        'minecraft:destroy_time': 2.0
    });

    return safeJson({
        format_version: '1.16.0',
        'minecraft:block': {
            description: {
                identifier: `addon:${name}`
            },
            components: componentData
        }
    });
}

export function setNestedValue(obj, keys, value) {
    const lastKey = keys.pop();
    const parent = keys.reduce((current, key) => {
        if (!current[key]) {
            current[key] = {};
        }
        return current[key];
    }, obj);
    parent[lastKey] = value;
}

export function addFilesToZip(zip, files, path = '') {
    for (const key of Object.keys(files)) {
        const value = files[key];
        const fullPath = path ? `${path}/${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            addFilesToZip(zip, value, fullPath);
        } else {
            zip.file(fullPath, value);
        }
    }
}

export function loadAddonsFromStorage() {
    return JSON.parse(localStorage.getItem('addons') || '[]');
}

export function saveAddonsToStorage(addons) {
    localStorage.setItem('addons', JSON.stringify(addons));
}

export function saveCurrentAddon(currentAddon) {
    const addons = loadAddonsFromStorage();
    addons.push(currentAddon);
    saveAddonsToStorage(addons);
}
