const { Order, User } = require("../models");
const { generateLinks } = require("../utils/hateoas");
const bcrypt = require("bcrypt");

const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");

class UserController {

    static async getAll(req, res) {
        const users = await User.findAll();
        
        const response = users.map(e => ({
            id: e.id,
            name: e.name,
            email: e.email,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
            _links: generateLinks("user", e.id, ["GET", "PUT", "DELETE"])
        }));

        res.status(200).json({
            count: response.length,
            users: response,
            _links: generateLinks("user", null, ["GET", "POST"])
        });
    };

    static async getByID(req, res) {
        const id = Number(req.params.id);

        // Verificar se o usuario existe
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFound(`Usuario com ID ${id} não encontrado`)
        };

        const { name, email, createdAt, updatedAt } = user;

        res.status(200).json({
            id,
            name,
            email,
            createdAt,
            updatedAt,
            _links: generateLinks("user", id, ["GET", "PUT", "DELETE"])
        });
    };

    static async update(req, res) {
        const id = Number(req.params.id);
        const { name, email, password } = req.body;

        // Verificar se o usuario existe
        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFound(`Usuario com ID ${id} não encontrado`)
        };
        
        // Atualiza os campos do usuario
        if (name) user.name = name;

        // Atualiza e verifica se o email já existe
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                throw new Conflict(`Email já esta cadastrado`)
            }
            user.email = email;
        };

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        };

        // Salva as alterações
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
    };

    static async delete(req, res) {
        const id = Number(req.params.id);
        const tokenId = req.userId;

        const user = await User.findByPk(id);
        if (!user) {
            throw new NotFound(`Usuário com ID ${id} não encontrado`);
        }

        const orders = await Order.findAll({ where: { userId: id } });

        if (tokenId === id) {
            if (orders.length > 0) {
                throw new Conflict(`Você não pode deletar sua própria conta pois existem ${orders.length} pedido(s) associado(s) a ela.`);
            }
        } else {
            if (orders.length > 0) {
                await Order.destroy({ where: { userId: id } });
            }
        }
        
        await user.destroy();

        return res.status(200).json({
            message: "Usuário deletado com sucesso",
            _links: generateLinks("user", null, ["GET", "POST"])
        });
    }

};

module.exports = UserController;