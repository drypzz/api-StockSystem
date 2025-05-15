const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const OrderProduct = require("../models/OrderProduct");

class OrderController {
    
    static async getAll(req, res) {
        try {
            const orders = await Order.findAll(); // Listar todos os pedidos
            res.status(200).json({orders});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar pedidos", error: error.message });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            
            // Verificar se o pedido existe
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o pedido", error: error.message });
        };
    };

    static async create(req, res) {
        try {
            const { userId, items } = req.body;

            // Verificar se os campos obrigatórios estão presentes
            if (!userId || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: "Campos obrigatórios ausentes ou inválidos" });
            };

            // Verificar se o usuário existe
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(400).json({ message: "Usuário não encontrado" });
            };

            // Verificar se os produtos existem e se não há produtos repetidos
            const productIds = items.map(i => i.productId);
            if (new Set(productIds).size !== productIds.length) {
                return res.status(400).json({ message: "Produtos repetidos não são permitidos" });
            };

            // Verificar se os produtos existem
            const foundProducts = await Product.findAll({ where: { id: productIds } });
            if (foundProducts.length !== productIds.length) {
                return res.status(400).json({ message: "Alguns produtos não foram encontrados" });
            };

            // Verificar estoque antes de criar o pedido
            for (const item of items) {
                const product = foundProducts.find(p => p.id === item.productId); // Encontrar o produto correspondente
                if (item.quantity > product.quantity) { // Verificar se a quantidade solicitada é maior que a disponível
                    return res.status(400).json({ message: `Estoque insuficiente para o produto '${product.name}'. Disponível: ${product.quantity}. Solicitado: ${item.quantity}` });
                };
            };

            // Criar o pedido
            const order = await Order.create({ userId });

            // Criar itens do pedido e atualizar estoque
            for (const item of items) {
                const product = foundProducts.find(p => p.id === item.productId); // Encontrar o produto correspondente

                await OrderProduct.create({ // Criar o item do pedido
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity
                });

                await product.update({ // Atualizar o estoque do produto
                    quantity: product.quantity - item.quantity
                });
            };

            // Incluir os produtos no pedido
            const orderWithItems = await Order.findByPk(order.id, {
                include: {
                    model: Product,
                    through: { attributes: ['quantity'] }
                }
            });

            return res.status(201).json({ message: "Pedido criado com sucesso", order: orderWithItems });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao criar o pedido", error: error.message });
        };
    };


    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
            
            // Verificar se o pedido existe
            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };
            
            // Deleta o pedido
            await Order.destroy();
    
            res.json({ message: "Pedido deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar o pedido", error: error.message });
        };
    };
};

module.exports = OrderController;