# BRArchive Compiler — Advanced Starter

Esta versión mejora la base anterior y usa `brarchive-cli` como motor real para la generación de `.brarchive`.

## Por qué esta versión es más segura

No intenta reconstruir el formato binario de BRArchive con JavaScript. El proyecto de referencia publica `brarchive-cli`, con `encode --recursive`, que recorre un pack y crea la estructura `__brarchive`. Esto evita una implementación binaria casera.

## Ejecutar con Docker (recomendado)

```bash
docker build -t brarchive-compiler .
docker run --rm -p 3000:3000 brarchive-compiler
```

Abrir `http://localhost:3000`.

## Ejecutar sin Docker

Instala Node.js y el CLI de BRArchive:

```bash
cargo install brarchive-cli
npm install
npm start
```

## Flujo

`.mcaddon` → extraer `.mcpack` → procesar cada pack con `brarchive-cli encode --recursive` → volver a empaquetar `.mcaddon`.

## Nota

El progreso de la interfaz representa las etapas del trabajo; el servidor no expone todavía eventos internos de cada archivo. Para un progreso 100% real por archivo se puede añadir WebSocket/SSE en la siguiente versión.
