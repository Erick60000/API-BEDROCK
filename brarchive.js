/**
 * brarchive.js
 * ------------------------------------------------------------
 * Lógica del formato BRArchive (ERKBRAR1) aislada del resto de
 * la interfaz. Este archivo es el único que debe tocarse cuando
 * se termine de confirmar el formato real (ver plan inicial:
 * "Estado actual" — todavía falta comprobar exactamente cómo
 * funciona __brarchive antes de dar esto por definitivo).
 *
 * Todo lo marcado con ✏️ CAMBIA ESTO es un punto donde falta
 * reemplazar el comportamiento de ejemplo por la lógica real
 * una vez confirmada.
 * ------------------------------------------------------------
 */

const BRArchive = (() => {

  /**
   * Detecta si una carpeta dentro del zip es un Behavior Pack
   * o Resource Pack a partir de su manifest.json.
   * @param {Object} manifest - manifest.json ya parseado
   * @returns {"behavior"|"resource"|null}
   */
  function detectPackType(manifest) {
    const types = (manifest?.modules || []).map(m => m.type);
    if (types.includes("data") || types.includes("script")) return "behavior";
    if (types.includes("resources")) return "resource";
    return null;
  }

  /**
   * Recorre las entradas de un pack y decide cuáles requieren
   * un archivo .brarchive asociado.
   * ✏️ CAMBIA ESTO — reemplazar con las reglas reales de qué
   * archivos/carpetas generan .brarchive una vez confirmadas.
   * @param {Array<{path: string, data: Uint8Array}>} entries
   * @returns {Array<{path: string, data: Uint8Array}>} entradas que necesitan .brarchive
   */
  function selectEntriesForBrarchive(entries) {
    // Placeholder: por ahora no se marca nada hasta confirmar el formato.
    return [];
  }

  /**
   * Genera el contenido binario/texto de un archivo .brarchive
   * para una entrada concreta, en formato ERKBRAR1.
   * ✏️ CAMBIA ESTO — esta es la función central pendiente de
   * implementar con el formato real reverse-engineered.
   * @param {{path: string, data: Uint8Array}} entry
   * @returns {Uint8Array}
   */
  function buildBrarchiveFile(entry) {
    throw new Error(
      "BRArchive.buildBrarchiveFile: formato ERKBRAR1 aún no implementado. " +
      "Completar esta función antes de compilar addons reales."
    );
  }

  /**
   * Inserta/actualiza las carpetas __brarchive dentro de la
   * estructura de un pack, sin tocar ningún otro archivo
   * (componentes, geometrías, texturas, identificadores).
   * @param {Object} packFiles - mapa { path: Uint8Array } del pack completo
   * @returns {Object} packFiles actualizado con las carpetas __brarchive
   */
  function injectBrarchiveFolders(packFiles) {
    const targets = selectEntriesForBrarchive(
      Object.entries(packFiles).map(([path, data]) => ({ path, data }))
    );

    for (const entry of targets) {
      const dir = entry.path.substring(0, entry.path.lastIndexOf("/"));
      const fileName = entry.path.substring(entry.path.lastIndexOf("/") + 1);
      const brPath = `${dir}/__brarchive/${fileName}.brarchive`;
      packFiles[brPath] = buildBrarchiveFile(entry);
    }

    return packFiles;
  }

  return {
    detectPackType,
    selectEntriesForBrarchive,
    buildBrarchiveFile,
    injectBrarchiveFolders,
  };
})();
