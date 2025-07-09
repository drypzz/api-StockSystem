const express = require('express');
const router = express.Router();

const SupportController = require('../controllers/supportController');

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Operações relacionadas ao suporte e atendimento ao cliente.
 */

/**
 * @swagger
 * /api/v1/support/contact:
 *   post:
 *     summary: Envia uma mensagem do formulário de contato para o suporte.
 *     tags: [Support]
 *     description: Rota pública para que visitantes ou clientes possam enviar mensagens para a equipe de suporte.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Maria da Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria.silva@example.com"
 *               message:
 *                 type: string
 *                 example: "Olá, gostaria de saber mais sobre o status do meu pedido."
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/support/contact', SupportController.sendContactMessage);

module.exports = router;