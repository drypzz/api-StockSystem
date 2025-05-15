const { Order, User } = require("../models");

class UserController {

    static async getAll(req, res) {
        try {
            const users = await User.findAll(); // Lista todos os usuarios
            res.status(200).json({users});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar usuarios", error: error.message });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);

            // Verificar se o usuario existe
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Usuario não encontrado" });
            };

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o usuario", error: error.message });
        };
    };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name, email, password } = req.body;
    
            // Verificar se o usuario existe
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };
            
            // Atualiza os campos do usuario
            if (name) user.name = name;

            // Atualiza e verifica se o email já existe
            if (email && email !== user.email) {
                const existingEmail = await User.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(400).json({ message: "Email já cadastrado" });
                }
                user.email = email;
            };

            if (password) {
                user.password = await bcrypt.hash(password, 10);
            };
    
            // Salva as alterações
            await user.save();
    
            return res.status(200).json({ message: "Usuário atualizado com sucesso", user });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
            
            // Verifica se o usuario existe
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };

            // Verifica se o usuario é o mesmo que está logado
            if (req.userId === id) {
                return res.status(403).json({ message: "Você não pode deletar sua própria conta!" });
            };

            // Verifica se o usuario tem pedidos associados
            const order = await Order.findAll({ where: { userId: id } });

            // Deleta os pedidos associados ao usuario
            if (order.length > 0) {
                await Order.destroy({ where: { userId: id } });
            };
            
            // Deleta o usuario
            await user.destroy();
    
            res.json({ message: `Usuário deletado com sucesso${order.length > 0 ? ` junto com os seus ${order.length} pedidos atribuidos` : ""}`});
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar usuário", error: error.message });
        };
    };

};

module.exports = UserController;