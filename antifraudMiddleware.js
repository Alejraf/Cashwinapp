/**
 * Middleware Anti-Fraude para RewardApp
 * Protege contra emuladores, bots y peticiones masivas.
 */

// Simulación de base de datos de dispositivos registrados para evitar multicuentas
let registeredDevices = new Set();

function antiFraudMiddleware(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const deviceId = req.headers['x-device-id'] || req.body.deviceId;

    // 1. Detección básica de Emuladores en el User-Agent
    const emulatorKeywords = ['bluestacks', 'nox', 'genymotion', 'muemu', 'ldplayer', 'andy', 'sdk_gphone'];
    const isEmulator = emulatorKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));

    if (isEmulator) {
        console.warn(`[BLOQUEO ANTI-FRAUDE] Emulador detectado. IP: ${clientIp}, UA: ${userAgent}`);
        return res.status(403).json({
            success: false,
            error: "Acceso denegado. No se permiten emuladores ni entornos virtuales en esta aplicación."
        });
    }

    // 2. Control de Multicuentas por Device ID (Opcional estricto)
    if (deviceId && req.path.includes('/withdraw')) {
        // En un flujo real, verificas si este deviceId ya está vinculado a otra cuenta distinta
        // if (isDeviceLinkedToAnotherUser(deviceId, req.body.userId)) { ... }
    }

    // 3. Validación de cabeceras mínimas contra bots puros
    if (!userAgent || userAgent.length < 10) {
        return res.status(403).json({
            success: false,
            error: "Petición no válida."
        });
    }

    // Si pasa los filtros básicos, continúa
    next();
}

/**
 * Limitador de tasa simple (Rate Limiter) para evitar ataques de fuerza bruta o clics automatizados
 */
const requestCounts = {};
function rateLimiter(limitTimeMs = 2000) {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const now = Date.now();
        
        if (requestCounts[ip] && (now - requestCounts[ip] < limitTimeMs)) {
            return res.status(429).json({
                success: false,
                error: "Demasiadas peticiones en muy poco tiempo. Espere un momento."
            });
        }
        requestCounts[ip] = now;
        next();
    };
}

module.exports = { antiFraudMiddleware, rateLimiter };
