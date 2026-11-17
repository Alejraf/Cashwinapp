# Módulo Anti-Fraude - RewardApp

Este paquete contiene las herramientas y reglas básicas de seguridad para blindar tu backend contra fraudes comunes en apps de recompensas.

## Qué incluye:
1. **Detección de Emuladores:** Filtra peticiones cuyo `User-Agent` pertenezca a emuladores populares de PC (BlueStacks, Nox, LDPlayer, etc.).
2. **Rate Limiter:** Evita que scripts automatizados o bots spamen los endpoints del servidor con clics infinitos.
3. **Control de Dispositivo:** Preparado para validar identificadores de hardware y evitar multicuentas desde un mismo teléfono.

## Cómo integrarlo en tu servidor Express (`server.js`):
```javascript
const { antiFraudMiddleware, rateLimiter } = require('./antifraudMiddleware');

// Aplicar a rutas críticas como retiros o postbacks
app.post('/api/withdraw-pix', rateLimiter(5000), antiFraudMiddleware, async (req, res) => {
    // Lógica de retiro segura...
});
```
