# Automatización de Retiros Pix - Mercado Pago API

Este paquete contiene la implementación backend en **Node.js** utilizando el SDK oficial de **Mercado Pago (`mercadopago`)** para automatizar las transferencias de dinero salientes (**Payouts**) mediante **Pix** hacia las cuentas de tus usuarios.

## Archivos incluidos:
- `payoutService.js`: Clase encapsulada para interactuar con la API de Payouts de Mercado Pago y realizar transferencias Pix por clave (CPF, email, teléfono, etc.).
- `server.js`: Servidor Express con el endpoint `/api/withdraw-pix` que valida saldos, calcula conversiones de monedas a reales (BRL) y ejecuta el pago automático.
- `package.json`: Dependencias actualizadas con el SDK oficial de Mercado Pago.
- `.env.example`: Plantilla de variables de entorno para tu token privado.

## Requisitos Previos:
1. Tener una cuenta verificado de Mercado Pago (Brasil).
2. Obtener tus credenciales de producción (`Access Token` que comienza con `APP_USR-...`).
3. Asegurar saldo positivo en tu cuenta de Mercado Pago para poder cubrir las transferencias automáticas hacia los usuarios.
