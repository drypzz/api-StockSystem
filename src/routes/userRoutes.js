const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações de gerenciamento de usuários (normalmente para administradores)
 */

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     description: Retorna uma lista de todos os usuários registrados no sistema.
 *     responses:
 *       '200':
 *         description: Uma lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/user", userController.getAll);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       '200':
 *         description: O usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/user/:id", userController.getByID);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     summary: Atualiza um usuário existente
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       description: Apenas os campos a serem atualizados. A senha é opcional.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 description: "Opcional. Envie apenas se desejar alterar a senha."
 *     responses:
 *       '200':
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.put("/user/:id", userController.update);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       '204':
 *         description: Usuário deletado com sucesso (sem conteúdo)
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: "Ação proibida (ex: tentar deletar a própria conta)."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/user/:id", userController.delete);

module.exports = router;