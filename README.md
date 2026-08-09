# BRArchive Compiler

Proyecto inicial de una página web para procesar `.mcaddon`.

## Estado

Esta primera versión contiene:
- interfaz web para Android;
- selección de `.mcaddon`;
- subida al backend;
- extracción básica;
- procesamiento aislado;
- recompresión del addon;
- descarga del resultado.

## Importante

La generación de `.brarchive` todavía NO se considera implementada. El archivo `compiler.js` deja esa etapa aislada hasta verificar las reglas exactas del formato BRArchive. No se debe presentar esta versión como un compilador BRArchive definitivo.

## Ejecutar

```bash
npm install
npm start
```

Luego abrir:

`http://localhost:3000`
