const { MercadoPagoConfig, Payout } = require('mercadopago');

class PixPayoutService {
    constructor(accessToken) {
        this.client = new MercadoPagoConfig({ accessToken: accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN });
        this.payoutClient = new Payout(this.client);
    }

    async sendPixPayout(externalReference, amountBRL, pixKey, pixKeyType, userName) {
        try {
            const payoutData = {
                body: {
                    external_reference: externalReference,
                    amount: amountBRL,
                    payment_method_id: "pix",
                    recipient: {
                        name: userName,
                        bank_account: { key: pixKey, key_type: pixKeyType }
                    }
                },
                requestOptions: { idempotencyKey: `payout_${externalReference}_${Date.now()}` }
            };
            const response = await this.payoutClient.create(payoutData);
            return { success: true, payoutId: response.id, status: response.status };
        } catch (error) {
            return { success: false, error: error.message || "Error en Payout Pix" };
        }
    }
}

module.exports = PixPayoutService;
