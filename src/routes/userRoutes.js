const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const TokenController = require("../middlewares/auth.token");
const create = require("../middlewares/auth.register");

router.use(TokenController.token);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações relacionadas a usuários
 */

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Retorna todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                         example: "/api/v1/user"
 *                       method:
 *                         type: string
 *                         example: "GET"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/user", userController.getAll);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/user/:id", userController.getByID);

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário criado com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos
 */
router.post("/user", create.register);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário atualizado com sucesso"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email já cadastrado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/user/:id", userController.update);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Deleta um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário deletado com sucesso"
 *                 _links:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       href:
 *                         type: string
 *                         example: "/api/v1/user"
 *                       method:
 *                         type: string
 *                         example: "GET"
 *       403:
 *         description: Tentativa de deletar própria conta
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/user/:id", userController.delete);

module.exports = router;
