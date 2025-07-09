const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Unauthorized = require("../errors/unauthorized");
const MissingValues = require("../errors/missing-values");
const NotFound = require("../errors/not-found");

/**
 * @class LoginController
 * @summary Gerencia o processo de login e autenticação do usuário.
*/
class LoginController {

    /**
     * @method login
     * @summary Valida as credenciais e retorna um token JWT em caso de sucesso.
     * @description O método executa as seguintes etapas:
     * 1. Valida se 'email' e 'password' foram fornecidos.
     * 2. Busca o usuário no banco de dados pelo e-mail.
     * 3. Compara a senha fornecida com o hash armazenado no banco usando bcrypt.
     * 4. Se tudo for válido, gera um token JWT com o ID do usuário, válido por 1 hora.
     * 5. Retorna o token e os dados básicos do usuário.
     * Erros são lançados usando classes customizadas para serem tratados pelo middleware.
    */
    static async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new MissingValues({ email, password });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new NotFound("Usuário com este email não foi encontrado");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Unauthorized("Senha incorreta");
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.json({
            message: "Login realizado com sucesso",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    };
};

module.exports = LoginController;
