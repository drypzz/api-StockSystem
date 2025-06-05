const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require('../models/User');
const Unauthorized = require("../errors/unauthorized");

class TokenController {
    static async token(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new Unauthorized("Acesso negado! Token não fornecido.");
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new Unauthorized("Formato de token inválido. Use Bearer <token>.");
        }

        const token = parts[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "drypzz");

            const user = await User.findByPk(decoded.id);

            if (!user) {
                // Aqui explicitamente identificamos que o token é válido mas o usuário foi deletado
                throw new Unauthorized("Usuário não encontrado. O token está vinculado a um usuário que foi deletado.");
            }

            req.userId = decoded.id;

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Unauthorized("Token expirado.");
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Unauthorized("Token inválido.");
            }
            next(error);
        }
    }
};

module.exports = TokenController;
