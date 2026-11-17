const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MercadoPagoPixService = require('./mercadopagoService');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const mpService = new MercadoPagoPixService(process.env.MERCADO_PAGO_ACCESS_TOKEN);

// Base de datos de ejemplo
let usersDB = {
    "user_123": { id: "user_123", name: "Rafael Vasquez", coins: 10000 }
};

app.post('/api/withdraw-pix', async (req, res) => {
    const { userId, pixKey, pixKeyType, amountCoins } = req.body;
    const user = usersDB[userId];

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const MIN_COINS = 5000;
    const RATE = 1000; // 1000 monedas = R$ 1.00

    if (amountCoins < MIN_COINS || user.coins < amountCoins) {
        return res.status(400).json({ error: "Saldo insuficiente o menor al mínimo requerido" });
    }

    const amountBRL = parseFloat((amountCoins / RATE).toFixed(2));
    const refId = `payout_${userId}_${Date.now()}`;

    // Ejecuta la transferencia real mediante Mercado Pago API
    const result = await mpService.transferPix(refId, amountBRL, pixKey, pixKeyType || 'CPF', user.name);

    if (result.success) {
        user.coins -= amountCoins;
        return res.json({
            success: true,
            message: "¡Transferencia Pix ejecutada con éxito!",
            payoutId: result.payoutId,
            status: result.status,
            newBalance: user.coins
        });
    } else {
        return res.status(500).json({
            success: false,
            error: "La API de Mercado Pago rechazó la transferencia",
            details: result.error
        });
    }
});

app.listen(PORT, () => console.log(`Servidor Mercado Pago Pix activo en puerto ${PORT}`));
