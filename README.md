# Backend de Recompensas - RewardApp

Servidor backend desarrollado en **Node.js (Express)** diseñado para gestionar la acreditación automática de recompensas mediante Postbacks y procesar solicitudes de retiro.

## Estructura del proyecto
- `server.js`: Lógica principal del servidor con endpoints de Postback (`/api/postback`), consulta de usuario y procesamiento de retiros.
- `package.json`: Dependencias del proyecto.
- `.env.example`: Variables de entorno requeridas.

## Cómo ejecutarlo localmente:
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Configura tus variables de entorno copiando `.env.example` a `.env`.
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
