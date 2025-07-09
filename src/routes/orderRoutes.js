const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operações de gerenciamento de pedidos
 */

/**
 * @swagger
 * /api/v1/order/user:
 *   get:
 *     summary: Retorna todos os pedidos do usuário autenticado
 *     tags: [Orders]
 *     responses:
 *       '200':
 *         description: Uma lista de pedidos detalhados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderDetail'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/order/user", orderController.getByUser);

/**
 * @swagger
 * /api/v1/order/{publicId}:
 *   get:
 *     summary: Retorna um pedido específico pelo seu ID público (UUID)
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/publicIdParam'
 *     responses:
 *       '200':
 *         description: O pedido detalhado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetail'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/order/:publicId", orderController.getByID);

/**
 * @swagger
 * /api/v1/order:
 *   post:
 *     summary: Cria um novo pedido a partir de uma lista de itens
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOrderRequest'
 *     responses:
 *       '201':
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/order", orderController.create);

/**
 * @swagger
 * /api/v1/order/{publicId}:
 *   delete:
 *     summary: Deleta um pedido (se ainda não estiver pago)
 *     tags: [Orders]
 *     parameters:
 *       - $ref: '#/components/parameters/publicIdParam'
 *     responses:
 *       '204':
 *         description: Pedido deletado com sucesso (sem conteúdo)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/order/:publicId", orderController.delete);

module.exports = router;
