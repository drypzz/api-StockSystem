const { User, Order } = require("../models");
const { generateLinks } = require("../utils/hateoas");
const bcrypt = require("bcrypt");

const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");
const Unauthorized = require("../errors/unauthorized");

/**
 * @class UserController
 * @summary Gerencia as operações de CRUD para Usuários.
*/
class UserController {

    /**
     * @method getAll
     * @summary Lista todos os usuários, omitindo dados sensíveis como senhas.
    */
    static async getAll(req, res) {
        const users = await User.findAll();

        const response = users.map(({ id, name, email, createdAt, updatedAt }) => ({
            id,
            name,
            email,
            createdAt,
            updatedAt,
            _links: generateLinks("user", id, ["GET", "PUT", "DELETE"])
        }));

        return res.status(200).json({
            count: response.length,
            users: response,
            _links: generateLinks("user", null, ["GET", "POST"])
        });
    }

    /**
     * @method getByID
     * @summary Busca um único usuário pelo ID, também omitindo a senha.
    */
    static async getByID(req, res) {
        const id = Number(req.params.id);
        const user = await User.findByPk(id);

        if (isNaN(id)) {
            throw new Unauthorized("ID invalido")
        };

        if (!user) {
            throw new NotFound("Usuário não encontrado");
        }

        const { name, email, createdAt, updatedAt } = user;

        return res.status(200).json({
            id,
            name,
            email,
            createdAt,
            updatedAt,
            _links: generateLinks("user", id, ["GET", "PUT", "DELETE"])
        });
    }

    /**
     * @method update
     * @summary Atualiza os dados de um usuário, permitindo alterar nome, e-mail (com verificação de duplicidade) e senha (com rehashing).
    */
    static async update(req, res) {
        const id = Number(req.params.id);
        const { name, email, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFound("Usuário não encontrado");
        }

        if (name) user.name = name;

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                throw new Conflict("Este e-mail já está em uso por outro usuário");
            }
            user.email = email;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        return res.status(200).json({
            message: "Usuário atualizado com sucesso",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                _links: generateLinks("user", user.id, ["GET", "PUT", "DELETE"])
            }
        });
    }

    /**
     * @method delete
     * @summary Deleta a conta do próprio usuário autenticado.
     * @description Impede a exclusão se houver pedidos pendentes e remove os pedidos
     * antigos do usuário antes de deletar a conta para manter a integridade dos dados.
    */
    static async delete(req, res, next) {
        try {
            const id = Number(req.params.id);
            const tokenId = req.userId;

            if (id !== tokenId) {
                throw new Unauthorized("Você não tem permissão para deletar esta conta.");
            }

            const user = await User.findByPk(id);
            if (!user) {
                throw new NotFound(`Usuário não encontrado`);
            }

            const pendingOrdersCount = await Order.count({
                where: {
                    userId: id,
                    paymentStatus: 'pending'
                }
            });

            if (pendingOrdersCount > 0) {
                throw new Conflict(`Você não pode deletar sua conta pois possui ${pendingOrdersCount} pedido(s) pendente(s).`);
            }

            await Order.destroy({
                where: { userId: id }
            });

            await user.destroy();

            return res.status(200).json({
                message: "Usuário deletado com sucesso.",
                _links: generateLinks("user", null, ["GET", "POST"])
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;