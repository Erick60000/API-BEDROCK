# BRArchive Compiler

Página web para subir un `.mcaddon`, detectar sus Behavior/Resource Packs, generar las carpetas `__brarchive` correspondientes (formato **ERKBRAR1**) y descargar el addon procesado.

## Estado actual

🚧 **Solo la base de la interfaz y el flujo están implementados.** La generación real de archivos `.brarchive` (`js/brarchive.js`) está marcada con `✏️ CAMBIA ESTO` y lanza un error controlado a propósito: todavía falta confirmar exactamente qué archivos requieren `.brarchive` y el contenido binario real del formato antes de implementarlo en serio.

No se debe considerar esto un compilador funcional todavía — es el andamiaje (scaffold) sobre el que se construirá una vez cerrado el formato.

## Estructura

```
brarchive-compiler/
├── index.html          # 3 pantallas: subida, progreso, resultado
├── css/style.css        # estética consola/compilador
├── js/script.js         # UI: drag&drop, extracción zip (JSZip), etapas, descarga
├── js/brarchive.js      # lógica del formato ERKBRAR1 (pendiente de completar)
└── README.md
```

## Flujo

1. Seleccionar/arrastrar un `.mcaddon`
2. Extracción con JSZip en el navegador (sin backend por ahora)
3. Detección de BP/RP por `manifest.json`
4. Generación de `__brarchive` (pendiente — ver arriba)
5. Reempaquetado y descarga del `.mcaddon` resultante

## Reglas del proyecto

- No modificar lógica de entidades, componentes, eventos, geometrías, texturas ni identificadores.
- No inventar un formato `.brarchive` distinto al real.
- Debe funcionar bien desde Android (Chrome/Firefox móvil).
- Archivos grandes no deben congelar la interfaz (límite actual: 200 MB, procesamiento async).

## Próximos pasos

- [ ] Confirmar el formato binario/estructura exacta de `ERKBRAR1`
- [ ] Definir qué archivos dentro de un pack requieren `.brarchive`
- [ ] Implementar `BRArchive.buildBrarchiveFile` con el formato real
- [ ] Probar con `morph.mcaddon` (extracción, detección BP/RP, generación `__brarchive`, empaquetado, integridad)
- [ ] Evaluar si algo del proceso necesita backend (archivos muy grandes, procesamiento no viable en navegador)

## Desarrollo local

Al ser HTML/CSS/JS puro, basta con abrir `index.html` en un navegador, o servirlo local:

```bash
python3 -m http.server 8080
```
