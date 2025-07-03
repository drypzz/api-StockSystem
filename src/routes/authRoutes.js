const express = require("express");
const router = express.Router();

const LoginController = require("../middlewares/auth.login");
const RegisterController = require("../middlewares/auth.register");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação de usuários
 */

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */
router.post("/login", LoginController.login);

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '409':
 *         $ref: '#/components/responses/Conflict'
 */
router.post("/register", RegisterController.register);

module.exports = router;
