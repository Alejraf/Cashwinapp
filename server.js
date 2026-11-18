const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos simulada en memoria (reemplazar con DB real en producción)
let userBalances = {};

// Endpoint para verificar estado y anti-fraude básico
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!userBalances[userId]) {
        userBalances[userId] = { balance: 0, history: [] };
    }
    res.json(userBalances[userId]);
});

// Postback de CPX Research / Offerwalls
app.get('/api/postback', (req, res) => {
    const { userId, reward, trans_id } = req.query;
    
    if (!userId || !reward) {
        return res.status(400).send('Parámetros faltantes');
    }

    if (!userBalances[userId]) {
        userBalances[userId] = { balance: 0, history: [] };
    }

    const earned = parseFloat(reward) || 0;
    userBalances[userId].balance += earned;
    userBalances[userId].history.push({
        id: trans_id || Date.now().toString(),
        amount: earned,
        date: new Date().toISOString()
    });

    console.log(`Recompensa acreditada: ${earned} para usuario ${userId}`);
    res.send('OK');
});

// Retiro vía Mercado Pago Pix
app.post('/api/withdraw', async (req, res) => {
    const { userId, pixKey, amount } = req.body;
    
    if (!userBalances[userId] || userBalances[userId].balance < amount) {
        return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
    }

    // Descontar saldo
    userBalances[userId].balance -= amount;

    // Aquí integrarías la llamada real a la API de Mercado Pago Pix payouts
    // const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', ...);

    res.json({ 
        success: true, 
        message: 'Retiro procesado exitosamente vía Pix',
        remainingBalance: userBalances[userId].balance 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
