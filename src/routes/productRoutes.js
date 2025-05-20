const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const TokenController = require("../middlewares/auth.token");

router.use(TokenController.token);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Operações relacionadas a produtos
 */

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     summary: Retorna todos os produtos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                         example: "/api/v1/product"
 *                       method:
 *                         type: string
 *                         example: "GET"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/product", productController.getAll);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   get:
 *     summary: Retorna um produto pelo ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/product/:id", productController.getByID);

/**
 * @swagger
 * /api/v1/product:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - quantity
 *               - description
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto criado com sucesso"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Dados inválidos, categoria inexistente, quantidade negativa ou preço negativo
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/product", productController.create);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto atualizado com sucesso"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
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
 *         description: Categoria não encontrada
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/product/:id", productController.update);

/**
 * @swagger
 * /api/v1/product/{id}:
 *   delete:
 *     summary: Deleta um produto pelo ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto deletado com sucesso"
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
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/product/:id", productController.delete);

module.exports = router;
