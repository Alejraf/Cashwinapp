const express = require('express');
const cors = require('cors');
require('dotenv').config();
const PixPayoutService = require('./payoutService');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const pixService = new PixPayoutService(process.env.MERCADO_PAGO_ACCESS_TOKEN);

let usersDB = {
    "user_123": { id: "user_123", name: "Rafael Vasquez", coins: 10000, email: "rafael@example.com" }
};

// Postback endpoint for Offerwalls
app.get('/api/postback', (req, res) => {
    const { userId, reward, offerId, signature } = req.query;
    if (!userId || !reward) return res.status(400).json({ error: "Parámetros incompletos" });

    const rewardAmount = parseInt(reward, 10);
    if (!usersDB[userId]) usersDB[userId] = { id: userId, name: "Usuario", coins: 0 };
    usersDB[userId].coins += rewardAmount;

    console.log(`[POSTBACK] Usuario ${userId} ganó +${rewardAmount} monedas (Oferta: ${offerId || 'N/A'})`);
    return res.status(200).json({ success: true, newBalance: usersDB[userId].coins });
});

// Withdraw endpoint with Pix Payout
app.post('/api/withdraw-pix', async (req, res) => {
    const { userId, pixKey, pixKeyType, amountCoins } = req.body;
    const user = usersDB[userId];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const MIN_COINS = 5000;
    const CONVERSION_RATE = 1000; // 1000 monedas = R$ 1.00 BRL

    if (amountCoins < MIN_COINS || user.coins < amountCoins) {
        return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const amountBRL = parseFloat((amountCoins / CONVERSION_RATE).toFixed(2));
    const externalRef = `withdrawal_${userId}_${Date.now()}`;

    const payoutResult = await pixService.sendPixPayout(externalRef, amountBRL, pixKey, pixKeyType || 'CPF', user.name);

    if (payoutResult.success) {
        user.coins -= amountCoins;
        return res.status(200).json({ success: true, message: "Retiro Pix procesado", remainingCoins: user.coins });
    } else {
        return res.status(500).json({ success: false, error: payoutResult.error });
    }
});

app.listen(PORT, () => console.log(`RewardApp Master Backend corriendo en puerto ${PORT}`));
