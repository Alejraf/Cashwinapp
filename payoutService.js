/**
 * Servicio de Automatización de Retiros Pix mediante la API de Mercado Pago (Payouts)
 */
const { MercadoPagoConfig, Payout } = require('mercadopago');

class PixPayoutService {
    constructor(accessToken) {
        // Inicializa el cliente oficial de Mercado Pago con tu Access Token de producción
        this.client = new MercadoPagoConfig({ accessToken: accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN });
        this.payoutClient = new Payout(this.client);
    }

    /**
     * Ejecuta una transferencia Pix saliente (Payout) hacia la clave Pix del usuario.
     * @param {string} externalReference - ID único de la transacción en tu base de datos (ej. w_983247)
     * @param {number} amountBRL - Monto en reales (ej. 5.00)
     * @param {string} pixKey - Clave Pix del usuario (CPF, email, teléfono o clave aleatoria)
     * @param {string} pixKeyType - Tipo de clave ('CPF', 'EMAIL', 'PHONE', 'RANDOM', 'CNPJ')
     * @param {string} userName - Nombre del destinatario
     */
    async sendPixPayout(externalReference, amountBRL, pixKey, pixKeyType, userName) {
        try {
            // Estructura de solicitud para la API de Payouts / Transferencias de Mercado Pago
            const payoutData = {
                body: {
                    external_reference: externalReference,
                    amount: amountBRL,
                    payment_method_id: "pix",
                    recipient: {
                        name: userName,
                        bank_account: {
                            // Configuración específica para transferencia Pix por clave
                            key: pixKey,
                            key_type: pixKeyType
                        }
                    }
                },
                requestOptions: {
                    idempotencyKey: `payout_${externalReference}_${Date.now()}`
                }
            };

            // Ejecución contra la API de Mercado Pago
            const response = await this.payoutClient.create(payoutData);

            console.log(`[PIX PAYOUT EXITOSO] ID: ${response.id} | Estado: ${response.status} | Monto: R$ ${amountBRL}`);
            return {
                success: true,
                payoutId: response.id,
                status: response.status,
                message: "Transferencia Pix enviada con éxito"
            };

        } catch (error) {
            console.error("[ERROR PIX PAYOUT]", error.message || error);
            return {
                success: false,
                error: error.message || "Error al procesar transferencia Pix con Mercado Pago"
            };
        }
    }
}

module.exports = PixPayoutService;
