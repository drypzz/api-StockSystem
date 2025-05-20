const { Order, Product, OrderProduct, User } = require("../models");
const { generateLinks } = require("../utils/hateoas");

class OrderController {
    
    static async getAll(req, res) {
        try {
            const order = await Order.findAll();

            const response = order.map(order => ({
                ...order.toJSON(),
                _links: generateLinks("order", order.id, ["GET", "DELETE"])
            }));

            res.status(200).json({
                count: response.length,
                order: response,
                _links: generateLinks("order", null, ["GET", "POST"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar pedidos", error: error.message });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            const userId = req.userId;
            
            // Verificar se o pedido existe
            const order = await Order.findByPk(id, {
                include: {
                    model: Product,
                    through: { attributes: ['quantity'] }
                }
            });
            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };

            if (!userId) {
                return res.status(400).json({ message: "ID do usuário ausente" });
            };

            if (order.userId !== userId) {
                return res.status(403).json({ message: "Você não tem permissão para vizualizar este pedido" });
            };

            res.status(200).json({
                ...order.toJSON(),
                _links: generateLinks("order", order.id, ["GET", "DELETE"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o pedido", error: error.message });
        };
    };

    static async create(req, res) {
        try {
            const { items } = req.body;
            const userId = req.userId;

            // Verificar se os campos obrigatórios estão presentes
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: "Campos obrigatórios ausentes ou inválidos" });
            };

            if (!userId) {
                return res.status(400).json({ message: "ID do usuário ausente" });
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

            return res.status(201).json({
                message: "Pedido criado com sucesso",
                order: {
                    ...orderWithItems.toJSON(),
                    _links: generateLinks("order", order.id, ["GET", "DELETE"])
                }
            });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao criar o pedido", error: error.message });
        };
    };


    static async delete(req, res) {
        try {
            const id = Number(req.params.id);

            // Carrega pedido com produtos e quantidade do OrderProduct
            const order = await Order.findByPk(id, {
                include: [
                    {
                        model: Product,
                        through: { attributes: ['quantity'] }
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ message: "Pedido não encontrado" });
            };

            if (order.userId !== req.userId) {
                return res.status(403).json({ message: "Você não tem permissão para cancelar este pedido" });
            };

            // Restaurar estoque dos produtos
            for (const product of order.products) {
                const orderedQty = product.order_products?.quantity;

                if (typeof orderedQty !== 'number') {
                    return res.status(500).json({ message: `Erro ao acessar quantidade do produto '${product.name}'` });
                };

                product.quantity += orderedQty;
                await product.save();
            };

            // Deletar itens do pedido e depois o pedido
            await OrderProduct.destroy({ where: { orderId: id } });
            await Order.destroy({ where: { id } });

            return res.json({
                message: "Pedido cancelado e estoque restaurado com sucesso",
                _links: generateLinks("order", null, ["GET", "POST"])
            });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao cancelar o pedido", error: error.message });
        };
    };

};

module.exports = OrderController;