const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/auth.token");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Endpoints para iniciar pagamentos e receber notificações (webhooks)
 */

/**
 * @swagger
 * /api/v1/order/{publicId}/pay:
 *   post:
 *     summary: Cria ou obtém uma intenção de pagamento PIX para um pedido
 *     tags: [Payments]
 *     parameters:
 *       - $ref: '#/components/parameters/publicIdParam'
 *     responses:
 *       '200':
 *         description: QR Code PIX gerado ou obtido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '409':
 *         description: O pedido já foi pago.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/order/:publicId/pay", authMiddleware.token, PaymentController.getOrCreatePayment);

/**
 * @swagger
 * /api/v1/payments/webhook:
 *   post:
 *     summary: Webhook para receber notificações de status do Mercado Pago
 *     tags: [Payments]
 *     security: []
 *     description: |
 *       Este endpoint é chamado exclusivamente pelo serviço do Mercado Pago.
 *       Ele processa a notificação de pagamento (ex: aprovado, rejeitado), atualiza o status do pedido no banco de dados e dispara o envio do e-mail de confirmação para o cliente.
 *     requestBody:
 *       description: O payload enviado pelo Mercado Pago varia, mas geralmente contém o ID do pagamento.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123456789"
 *     responses:
 *       '200':
 *         description: Notificação recebida e processada com sucesso. Retorna um texto simples.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Webhook processado"
 */
router.post("/payments/webhook", async (req, res, next) => {
    try {
        await PaymentController.handleWebhook(req, res, next);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
