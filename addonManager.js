import { generateUUID, safeJson } from './utils.js';

export function createAddon({ nombre, version, descripcion, uuid }) {
    const addonUuid = uuid || generateUUID();

    return {
        nombre,
        version,
        descripcion,
        uuid: addonUuid,
        files: {
            'manifest.json': generateManifest(nombre, version, descripcion, addonUuid),
            behavior_pack: {
                entities: {},
                blocks: {}
            },
            resource_pack: {
                textures: {}
            }
        },
        entidades: [],
        bloques: [],
        texturas: []
    };
}

export function generateManifest(name, version, description, uuid) {
    return safeJson({
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
                type: 'data',
                uuid: generateUUID(),
                version: version.split('.').map(Number)
            },
            {
                description: description,
                type: 'resources',
                uuid: generateUUID(),
                version: version.split('.').map(Number)
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
                acc[comp] = {};
                return acc;
            }, {})
        }
    });
}

export function generateBlockJson(name) {
    return safeJson({
        format_version: '1.16.0',
        'minecraft:block': {
            description: {
                identifier: `addon:${name}`
            },
            components: {
                'minecraft:loot': `loot_tables/blocks/${name}.json`,
                'minecraft:destroy_time': 2.0
            }
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
