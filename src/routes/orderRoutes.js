const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const TokenController = require("../middlewares/auth.token");

router.use(TokenController.token);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operações relacionadas a pedidos
 */

/**
 * @swagger
 * /api/v1/order:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/order", orderController.getAll);

/**
 * @swagger
 * /api/v1/order/{id}:
 *   get:
 *     summary: Retorna um pedido pelo ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/order/:id", orderController.getByID);

/**
 * @swagger
 * /api/v1/order:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pedido criado com sucesso
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos, usuário ou produtos não encontrados, ou estoque insuficiente
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/order", orderController.create);

/**
 * @swagger
 * /api/v1/order/{id}:
 *   delete:
 *     summary: Deleta um pedido pelo ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido deletado com sucesso
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/order/:id", orderController.delete);

module.exports = router;
