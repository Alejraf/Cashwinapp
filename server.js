const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PixPayoutService = require('./payoutService');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const pixService = new PixPayoutService(process.env.MERCADO_PAGO_ACCESS_TOKEN);

// Base de datos simulada de usuarios
let usersDB = {
    "user_123": { id: "user_123", name: "Rafael Vasquez", coins: 10000, email: "rafael@example.com" }
};

/**
 * Endpoint para procesar el retiro automático por Pix
 */
app.post('/api/withdraw-pix', async (req, res) => {
    const { userId, pixKey, pixKeyType, amountCoins } = req.body;

    const user = usersDB[userId];
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const MIN_COINS = 5000;
    const CONVERSION_RATE = 1000; // 1,000 monedas = R$ 1.00 BRL

    if (amountCoins < MIN_COINS || user.coins < amountCoins) {
        return res.status(400).json({ error: "Saldo insuficiente o menor al mínimo de retiro (5,000 monedas)" });
    }

    const amountBRL = parseFloat((amountCoins / CONVERSION_RATE).toFixed(2));
    const externalRef = `withdrawal_${userId}_${Date.now()}`;

    console.log(`[SOLICITUD DE RETIRO] Usuario ${user.name} solicita R$ ${amountBRL} (${amountCoins} monedas) a Pix: ${pixKey}`);

    // Ejecutar transferencia automática por Pix con Mercado Pago
    const payoutResult = await pixService.sendPixPayout(
        externalRef,
        amountBRL,
        pixKey,
        pixKeyType || 'CPF',
        user.name
    );

    if (payoutResult.success) {
        // Descontar monedas al usuario solo si el pago fue aceptado por la API
        user.coins -= amountCoins;

        return res.status(200).json({
            success: true,
            message: "¡Retiro procesado y transferido por Pix con éxito!",
            payoutId: payoutResult.payoutId,
            status: payoutResult.status,
            remainingCoins: user.coins,
            amountSentBRL: amountBRL
        });
    } else {
        return res.status(500).json({
            success: false,
            error: "No se pudo completar la transferencia Pix",
            details: payoutResult.error
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Retiros Automáticos Pix corriendo en el puerto ${PORT}`);
});
