# Editor de Addons Minecraft Bedrock

Una página web para crear y modificar addons de Minecraft Bedrock con soporte para entidades, bloques, texturas y descarga en ZIP.

## 🚀 Características

- Crear un addon completo con manifest
- Compatibilidad con Minecraft Bedrock 1.26.x
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
├── assets/
│   └── icons/             # Carpeta para iconos y recursos gráficos
├── src/
│   ├── css/
│   │   └── styles.css     # Estilos principales de la aplicación
│   └── js/
│       ├── addonManager.js
│       ├── app.js
│       ├── ui.js
│       ├── utils.js
│       └── script.js      # Código legacy existente (no cargado por index)
├── index.html             # Interfaz de usuario principal
└── README.md              # Documentación del proyecto
```

## 🖥️ Cómo funciona

- `index.html` carga `app.js` como módulo.
- `app.js` usa `addonManager.js` para crear y modificar datos.
- `ui.js` muestra el árbol de archivos y listas de bloques/entidades.
- `utils.js` maneja descargas y generación de UUID.

## 📝 Autor

Erick60000
