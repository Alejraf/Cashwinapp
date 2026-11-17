/**
 * Servicio de Automatización de Retiros Pix con la API Oficial de Mercado Pago
 */
const { MercadoPagoConfig, Payout } = require('mercadopago');

class MercadoPagoPixService {
    constructor(accessToken) {
        // Inicializa el SDK con tu Token de Producción (APP_USR-...)
        this.client = new MercadoPagoConfig({ accessToken: accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN });
        this.payoutClient = new Payout(this.client);
    }

    async transferPix(referenceId, amountBRL, pixKey, pixKeyType, recipientName) {
        try {
            const payoutData = {
                body: {
                    external_reference: referenceId,
                    amount: amountBRL,
                    payment_method_id: "pix",
                    recipient: {
                        name: recipientName,
                        bank_account: {
                            key: pixKey,
                            key_type: pixKeyType // 'CPF', 'EMAIL', 'PHONE', 'RANDOM', 'CNPJ'
                        }
                    }
                },
                requestOptions: {
                    idempotencyKey: `mp_payout_${referenceId}_${Date.now()}`
                }
            };

            const response = await this.payoutClient.create(payoutData);
            return {
                success: true,
                payoutId: response.id,
                status: response.status
            };
        } catch (error) {
            console.error("Error en Mercado Pago Payout:", error.message || error);
            return {
                success: false,
                error: error.message || "Error procesando transferencia Pix"
            };
        }
    }
}

module.exports = MercadoPagoPixService;
