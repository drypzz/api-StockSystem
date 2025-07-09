const jwt = require("jsonwebtoken");

const User = require('../models/User');
const Unauthorized = require("../errors/unauthorized");

/**
 * @class TokenController
 * @summary Middleware para validar tokens JWT e proteger rotas.
*/
class TokenController {

    /**
     * @method token
     * @summary Verifica a validade de um token JWT no cabeçalho da requisição.
     * @description Atua como um "guardião" para rotas protegidas:
     * 1. Extrai o token do cabeçalho 'Authorization', esperando o formato "Bearer <token>".
     * 2. Usa 'jwt.verify' para decodificar e validar a assinatura e o prazo de validade do token.
     * 3. Após decodificar, verifica se o usuário (com o 'id' do token) ainda existe no banco.
     * 4. Se tudo estiver correto, anexa o 'userId' ao objeto 'req' e passa para o próximo middleware/controller.
     * 5. Captura e trata erros específicos de JWT (expirado, inválido) para retornar respostas claras.
    */
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findByPk(decoded.id);

            if (!user) {
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
