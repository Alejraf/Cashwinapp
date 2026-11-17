const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Base de datos simulada (reemplazar con PostgreSQL / MongoDB en producción)
let usersDB = {
    "user_123": { id: "user_123", name: "Rafael", coins: 1250, email: "rafael@example.com" }
};

/**
 * 1. ENDPOINT DE POSTBACK / WEBHOOK PARA OFFFERWALLS
 * Recibe la notificación cuando un usuario completa una tarea o juego.
 * Ejemplo de llamada: /api/postback?userId=user_123&reward=500&offerId=game_01&signature=xyz
 */
app.get('/api/postback', (req, res) => {
    const { userId, reward, offerId, signature } = req.query;

    if (!userId || !reward) {
        return res.status(400).json({ error: "Faltan parámetros obligatorios (userId, reward)" });
    }

    // TODO: Validar la firma criptográfica (security signature) provista por el Offerwall
    // if (!verifyOfferwallSignature(signature, req.query)) {
    //     return res.status(403).json({ error: "Firma de seguridad inválida" });
    // }

    const rewardAmount = parseInt(reward, 10);
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
        return res.status(400).json({ error: "Cantidad de recompensa inválida" });
    }

    // Actualizar saldo del usuario en la base de datos
    if (!usersDB[userId]) {
        // Crear usuario si no existe (o rechazar según tu lógica)
        usersDB[userId] = { id: userId, name: "Nuevo Usuario", coins: 0 };
    }

    usersDB[userId].coins += rewardAmount;

    console.log(`[POSTBACK EXITOSO] Usuario: ${userId} | Ganó: +${rewardAmount} monedas | Oferta: ${offerId || 'N/A'}`);
    
    return res.status(200).json({
        success: true,
        message: "Recompensa acreditada correctamente",
        newBalance: usersDB[userId].coins
    });
});

/**
 * 2. ENDPOINT PARA CONSULTAR SALDO DEL USUARIO
 */
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;
    const user = usersDB[userId];

    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(user);
});

/**
 * 3. ENDPOINT PARA SOLICITAR RETIRO (PIX / PAYPAL)
 */
app.post('/api/withdraw', async (req, res) => {
    const { userId, method, destination, amountCoins } = req.body;

    const user = usersDB[userId];
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const MIN_WITHDRAW_COINS = 5000;
    if (user.coins < amountCoins || user.coins < MIN_WITHDRAW_COINS) {
        return res.status(400).json({ error: "Saldo insuficiente para realizar el retiro" });
    }

    try {
        if (method === 'pix') {
            // Lógica de integración con Mercado Pago API para Pix
            // const pixResult = await executeMercadoPagoPix(destination, amountCoins);
            
            // Descontar monedas al usuario tras éxito del pago
            user.coins -= amountCoins;

            console.log(`[RETIRO PIX] Usuario ${userId} retiró ${amountCoins} monedas a clave Pix: ${destination}`);
            return res.json({
                success: true,
                message: "Retiro por Pix procesado con éxito",
                remainingBalance: user.coins
            });
        } else {
            return res.status(400).json({ error: "Método de pago no soportado" });
        }
    } catch (error) {
        console.error("[ERROR RETIRO]", error);
        return res.status(500).json({ error: "Error interno al procesar el pago" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend de recompensas corriendo en el puerto ${PORT}`);
});
