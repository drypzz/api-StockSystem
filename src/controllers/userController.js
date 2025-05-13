const User = require("../models/User");
const Order = require("../models/Order");
// const bcrypt = require("bcrypt");

class UserController {

    static async getAll(req, res) {
        try {
            const users = await User.findAll();
            res.status(200).json({users});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar usuarios", error });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ message: "Usuario não encontrado" });
            };

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o usuario", error });
        };
    };

    // static async create(req, res) {
    //     try {
    //         const { name, email, password } = req.body;

    //         if (!name || !email || !password) {
    //             return res.status(400).json({ message: "Todos os campos sao obrigatórios" });
    //         };

    //         const findEmail = await User.findOne({ where: { email } });
    //         if (findEmail) {
    //             return res.status(400).json({ message: "Email ja registrado" });
    //         };
            
    //         const hashedPassword = await bcrypt.hash(password, 10);
    //         const newUser = await User.create({ name, email, password: hashedPassword });

    //         res.status(201).json({ message: "Usuario criado com sucesso", newUser });
    //     } catch (error) {
    //         res.status(500).json({ message: "Erro ao criar usuario", error });
    //     };
    // };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name, email, password } = req.body;
    
            const user = await User.findByPk(id);
    
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };
    
            if (name) user.name = name;

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
    
            await user.save();
    
            return res.status(200).json({ message: "Usuário atualizado com sucesso", user });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar usuário", error });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
    
            if (req.userId === id) {
                return res.status(403).json({ message: "Você não pode deletar sua própria conta!" });
            };
    
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };
    
            const order = await Order.findAll({ where: { userId: id } });
    
            if (order.length > 0) {
                await Order.destroy({ where: { userId: id } });
            };
    
            await user.destroy();
    
            res.json({ message: `Usuário deletado com sucesso${order.length > 0 ? ` junto com os seus ${order.length} pedidos atribuidos` : ""}`});
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar usuário", error });
        };
    };

};

module.exports = UserController;