const Order = require("../models/Order");
const User = require("../models/User");

class OrderController {
    
    static async getAll(req, res) {
        try {
            const orders = await Order.findAll();
            res.status(200).json({orders});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar pedidos", error });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            const order = await Order.findByPk(id);

            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o pedido", error });
        };
    };

    static async create(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ message: "Todos os campos sao obrigatórios" });
            };

            const findUserId = await User.findOne({ where: { userId } });
            if (!findUserId) {
                return res.status(400).json({ message: "Usuario não encontrado" });
            };

            const newOrder = await Order.create({ userId });

            res.status(201).json({ message: "Pedido criado com sucesso", newOrder });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar o pedido", error });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
    
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };
    
            await Order.destroy();
    
            res.json({ message: "Pedido deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar usuário", error });
        };
    };
};

module.exports = OrderController;