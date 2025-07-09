const User = require("../models/User");
const bcrypt = require("bcrypt");

const MissingValues = require("../errors/missing-values");
const Conflict = require("../errors/conflict");
const EmailValidade = require("../errors/email-validate");

/**
 * @class RegisterController
 * @summary Responsável pelo registro de novos usuários no sistema.
*/
class RegisterController {

    /**
     * @method register
     * @summary Cria um novo usuário após validar os dados de entrada.
     * @description Realiza uma sequência de validações e operações:
     * 1. Verifica se 'name', 'email' e 'password' estão presentes.
     * 2. Valida o formato do e-mail com uma expressão regular.
     * 3. Checa se o e-mail já existe no banco para evitar duplicatas.
     * 4. Gera um hash seguro da senha usando bcrypt.
     * 5. Cria o novo usuário no banco de dados com a senha hasheada.
     * 6. Retorna uma resposta de sucesso (201 Created) com os dados do novo usuário.
    */
    static async register(req, res) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new MissingValues({ name, email, password });
        }

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            throw new EmailValidade(email);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Conflict("Email já cadastrado");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            message: "Usuário criado com sucesso",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
}

module.exports = RegisterController;