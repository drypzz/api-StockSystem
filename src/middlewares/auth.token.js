const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require('../models/User'); // 1. IMPORTE SEU MODELO USER AQUI (ajuste o caminho se necessário)

const Unauthorized = require("../errors/unauthorized");

class TokenController {
    
    static async token(req, res, next) {
        const authHeader = req.headers.authorization;
        
        // Verifica se o cabeçalho de autorização existe
        if (!authHeader) {
            throw new Unauthorized("Acesso negado! Token não fornecido.");
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new Unauthorized("Formato de token inválido. Use Bearer <token>.")
        }

        const token = parts[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "drypzz");
            
            const user = await User.findByPk(decoded.id);

            // Verifica se o usuario existe no banco
            if (!user) {
                throw new Unauthorized("Token inválido ou usuário não existe mais.")
            }

            req.userId = decoded.id;

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Unauthorized("Token expirado.")
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Unauthorized("Token inválido.")
            }
            res.status(500).json({ message: "Erro interno ao verificar o token.", error: error.message });
        }
    }
};

module.exports = TokenController;