const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

let usersDB = {
    "user_123": { id: "user_123", name: "Rafael Vasquez", coins: 1250 }
};

/**
 * Endpoint de Postback universal para BitLabs / CPX Research / Adjoe
 * Cuando el usuario completa una oferta, el proveedor llama a esta URL de forma automática.
 */
app.get('/api/postback', (req, res) => {
    // Los parámetros varían ligeramente según el proveedor (ej. uid/sub_id para usuario, reward/payout para la ganancia)
    const { userId, reward, payout, sub_id, trans_id } = req.query;

    const targetUser = userId || sub_id;
    const earnedCoins = parseInt(reward || payout, 10);

    if (!targetUser || isNaN(earnedCoins)) {
        return res.status(400).json({ error: "Parámetros de postback incompletos o inválidos" });
    }

    if (!usersDB[targetUser]) {
        usersDB[targetUser] = { id: targetUser, name: "Nuevo Usuario", coins: 0 };
    }

    usersDB[targetUser].coins += earnedCoins;

    console.log(`[POSTBACK RECIBIDO] Usuario: ${targetUser} | Monedas acreditadas: +${earnedCoins} | Transacción: ${trans_id || 'N/A'}`);

    return res.status(200).send("OK");
});

app.listen(PORT, () => console.log(`Servidor con Postbacks de Offerwall activo en puerto ${PORT}`));
