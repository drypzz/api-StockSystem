const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Operações relacionadas a categorias de produtos
 */

/**
 * @swagger
 * /api/v1/category:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/category", categoryController.getAll);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   get:
 *     summary: Retorna uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/category/:id", categoryController.getByID);

/**
 * @swagger
 * /api/v1/category:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Eletrônicos
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categoria criada com sucesso
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Campo obrigatório ausente ou categoria já registrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/category", categoryController.create);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   put:
 *     summary: Atualiza uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Informática
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categoria atualizada com sucesso
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Nome já registrado
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/category/:id", categoryController.update);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   delete:
 *     summary: Deleta uma categoria pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categoria deletada com sucesso
 *       400:
 *         description: Existem produtos vinculados a essa categoria
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/category/:id", categoryController.delete);

module.exports = router;
