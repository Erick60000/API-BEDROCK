# Editor de Addons Minecraft Bedrock

Una página web para crear y modificar addons de Minecraft Bedrock con soporte para entidades, bloques, texturas y descarga en ZIP.

## 🚀 Características

- Crear un addon completo con manifest
- Agregar entidades con componentes personalizados
- Crear bloques y exportar archivos JSON
- Subir texturas y ver miniaturas
- Navegar la estructura de archivos del addon
- Guardar addons en `localStorage`
- Descargar el addon como ZIP

## 📋 Requisitos

- Navegador web moderno con soporte para módulos ES

## 💻 Uso

1. Abre `index.html` en tu navegador.
2. Completa el formulario y crea un addon.
3. Agrega entidades, bloques y texturas.
4. Guarda y descarga el addon como ZIP.

## 🧩 Estructura del proyecto

```
├── addonManager.js        # Lógica del addon y generación de JSON
├── app.js                 # Entrada principal de la app
├── ui.js                  # Render de UI y componentes visuales
├── utils.js               # Utilidades comunes como UUID y descargas
├── index.html             # Interfaz de usuario principal
├── styles.css             # Estilos de la página
└── script.js              # Código legacy existente (no cargado por index)
```

## 🖥️ Cómo funciona

- `index.html` carga `app.js` como módulo.
- `app.js` usa `addonManager.js` para crear y modificar datos.
- `ui.js` muestra el árbol de archivos y listas de bloques/entidades.
- `utils.js` maneja descargas y generación de UUID.

## 📝 Autor

Erick60000
