const { Order, Product, OrderProduct, User } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../erros/not-found");
const MissingValues = require("../erros/missing-values");
const Unauthorized = require("../erros/unauthorized");

class OrderController {
    
    static async getAll(req, res) {
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
    };

    static async getByID(req, res) {
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
            throw new NotFound("Pedido não encontrado")
        };

        if (!userId) {
            throw new Unauthorized("ID do usuário ausente")
        };

        if (order.userId !== userId) {
            throw new Unauthorized("Você não tem permissão para vizualizar este pedido")
        };

        res.status(200).json({
            ...order.toJSON(),
            _links: generateLinks("order", order.id, ["GET", "DELETE"])
        });
    };

    static async getByUser(req, res) {
        const userId = req.userId;

        if (!userId) {
            throw new Unauthorized("ID do usuário ausente")
        };

        const order = await Order.findAll({
            where: { userId },
            include: {
                model: Product,
                through: { attributes: ['quantity'] }
            }
        });

        const response = order.map(order => ({
            ...order.toJSON(),
            _links: generateLinks("order", order.id, ["GET", "DELETE"])
        }));

        return res.status(200).json({
            count: response.length,
            order: response,
            _links: generateLinks("order", null, ["GET", "POST"])
        });
    };

    static async create(req, res) {
        const { items } = req.body;
        const userId = req.userId;

        // Verificar se os campos obrigatórios estão presentes
        if (!Array.isArray(items) || items.length === 0) {
            throw new MissingValues({ items })
        };

        if (!userId) {
            throw new Unauthorized("ID do usuário ausente")
        };

        // Verificar se o usuário existe
        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFound("Usuario não encontrado")
        };

        // Verificar se os produtos existem e se não há produtos repetidos
        const productIds = items.map(i => i.productId);
        if (new Set(productIds).size !== productIds.length) {
            throw new Unauthorized("Produtos repetidos não são permitidos")
        };

        // Verificar se os produtos existem
        const foundProducts = await Product.findAll({ where: { id: productIds } });
        if (foundProducts.length !== productIds.length) {
            throw new NotFound("Alguns produtos não foram encontrados")
        };

        // Verificar estoque antes de criar o pedido
        for (const item of items) {
            const product = foundProducts.find(p => p.id === item.productId); // Encontrar o produto correspondente
            if (item.quantity > product.quantity) { // Verificar se a quantidade solicitada é maior que a disponível
                throw new Unauthorized(`Estoque insuficiente para o produto '${product.name}'. Disponível: ${product.quantity}. Solicitado: ${item.quantity}`)
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
    };


    static async delete(req, res) {
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
            throw new NotFound("Pedido não encontrado")
        };

        if (order.userId !== req.userId) {
            throw new Unauthorized("Você não tem permissão para cancelar este pedido")
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
    };

};

module.exports = OrderController;