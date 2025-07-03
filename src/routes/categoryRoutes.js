const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Operações para gerenciamento de categorias de produtos
 */

/**
 * @swagger
 * /api/v1/category:
 *   get:
 *     summary: Lista todas as categorias
 *     tags: [Categories]
 *     responses:
 *       '200':
 *         description: Uma lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/category", categoryController.getAll);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   get:
 *     summary: Busca uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       '200':
 *         description: A categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/category/:id", categoryController.getByID);

/**
 * @swagger
 * /api/v1/category:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       '201':
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/category", categoryController.create);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       '200':
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.put("/category/:id", categoryController.update);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   delete:
 *     summary: Deleta uma categoria
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       '204':
 *         description: Categoria deletada com sucesso (sem conteúdo)
 *       '400':
 *         description: "Não é possível excluir, pois existem produtos vinculados."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/category/:id", categoryController.delete);

module.exports = router;
