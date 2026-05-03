# API-BEDROCK - Chatbot con AWS Bedrock

Una aplicación de chatbot impulsada por IA usando AWS Bedrock Runtime. Interfaz web moderna con backend Node.js/Express.

## 🚀 Características

- Chat interactivo en tiempo real
- Integración con AWS Bedrock (Amazon Titan Text)
- Interfaz responsiva y moderna
- Soporte para múltiples modelos de IA

## 📋 Requisitos

- Node.js 14+ 
- AWS Account con acceso a Bedrock
- Credenciales AWS configuradas

## 💻 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/Erick60000/API-BEDROCK.git
cd API-BEDROCK
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar credenciales AWS**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

4. **Iniciar el servidor**
```bash
npm start
```

5. **Acceder a la aplicación**
- Abrir navegador en `http://localhost:3000`
- Ir a la página de chat: `http://localhost:3000/pages/chat.html`

## 🌐 Despliegue en Producción

### Opción 1: Vercel (Recomendado)
1. Instalar Vercel CLI: `npm i -g vercel`
2. Ejecutar: `vercel`
3. Seguir las instrucciones
4. Configurar variables de entorno en Vercel Dashboard

### Opción 2: Heroku
1. Instalar Heroku CLI
2. Login: `heroku login`
3. Crear app: `heroku create your-app-name`
4. Configurar variables: `heroku config:set AWS_ACCESS_KEY_ID=...`
5. Deploy: `git push heroku main`

### Opción 3: GitHub Pages + Backend Externo
- Frontend en GitHub Pages
- Backend en Render, Railway, u otro servicio

## 📂 Estructura del Proyecto

```
├── backend/
│   └── server.js          # Servidor Express
├── pages/
│   ├── chat.html          # Página principal del chat
│   ├── login.html         # (Futuro)
│   └── dashboard.html     # (Futuro)
├── scripts/
│   └── chat.js            # Lógica del cliente
├── styles/
│   └── style.css          # Estilos CSS
├── index.html             # Página de inicio
├── package.json           # Dependencias
└── README.md              # Este archivo
```

## 🔒 Seguridad

- Nunca commits credenciales AWS
- Usar variables de entorno
- Implementar autenticación en producción
- CORS configurado para dominios específicos

## 📝 Licencia

MIT

## 👨‍💻 Autor

Erick60000
