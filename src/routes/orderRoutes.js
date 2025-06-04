const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

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
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                       method:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/order", orderController.getAll);

/**
 * @swagger
 * /api/v1/order/user:
 *   get:
 *     summary: Retorna todos os pedidos do usuário autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 order:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 37
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                             description:
 *                               type: string
 *                             price:
 *                               type: number
 *                             quantity:
 *                               type: integer
 *                             categoryId:
 *                               type: integer
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                             order_products:
 *                               type: object
 *                               properties:
 *                                 quantity:
 *                                   type: integer
 *                       _links:
 *                         type: object
 *                         properties:
 *                           self:
 *                             type: object
 *                             properties:
 *                               href:
 *                                 type: string
 *                                 example: "/api/v1/order/37"
 *                               method:
 *                                 type: string
 *                                 example: "GET"
 *                           delete:
 *                             type: object
 *                             properties:
 *                               href:
 *                                 type: string
 *                                 example: "/api/v1/order/37"
 *                               method:
 *                                 type: string
 *                                 example: "DELETE"
 *                 _links:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           example: "/api/v1/order"
 *                         method:
 *                           type: string
 *                           example: "GET"
 *                     create:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           example: "/api/v1/order"
 *                         method:
 *                           type: string
 *                           example: "POST"
 *       401:
 *         description: Não autorizado (token ausente ou inválido)
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/order/user", orderController.getByUser);

/**
 * @swagger
 * /api/v1/order/{id}:
 *   get:
 *     summary: Retorna um pedido específico pelo ID
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
 *         description: Pedido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 37
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       quantity:
 *                         type: integer
 *                       categoryId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       order_products:
 *                         type: object
 *                         properties:
 *                           quantity:
 *                             type: integer
 *                 _links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           example: "/api/v1/order/37"
 *                         method:
 *                           type: string
 *                           example: "GET"
 *                     delete:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                           example: "/api/v1/order/37"
 *                         method:
 *                           type: string
 *                           example: "DELETE"
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
 *               - items
 *             properties:
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
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                       method:
 *                         type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Pedido deletado com sucesso
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                       method:
 *                         type: string
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/order/:id", orderController.delete);

module.exports = router;
