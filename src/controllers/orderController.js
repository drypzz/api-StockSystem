const { Order, Product, OrderProduct, User } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Unauthorized = require("../errors/unauthorized");
const { where } = require("sequelize");

class OrderController {

    static async getAll(req, res) {
        const order = await Order.findAll();

        const response = order.map(order => ({
            ...order.toJSON(),
            _links: generateLinks("order", order.publicId, ["GET", "DELETE"])
        }));

        res.status(200).json({
            count: response.length,
            orders: response,
            _links: generateLinks("order", null, ["GET", "POST"])
        });
    };

    static async getByID(req, res, next) {
        try {
            const { publicId } = req.params;
            const userId = req.userId;

            const order = await Order.findOne({
                where: { publicId },
                include: {
                    model: Product,
                    as: 'products',
                    through: { attributes: ['quantity'] }
                }
            });

            if (!order) {
                throw new NotFound("Pedido não encontrado");
            }
            if (order.userId !== userId) {
                throw new Unauthorized("Você não tem permissão para vizualizar este pedido");
            }

            res.status(200).json({
                ...order.toJSON(),
                _links: generateLinks("order", order.publicId, ["GET", "DELETE"])
            });
        } catch (error) {
            next(error);
        }
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
                as: 'products',
                through: { attributes: ['quantity'] }
            }
        });

        const response = order.map(order => ({
            ...order.toJSON(),
            _links: generateLinks("order", order.publicId, ["GET", "DELETE"])
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

        if (!Array.isArray(items) || items.length === 0) {
            throw new MissingValues({ items });
        }

        if (!userId) {
            throw new Conflict("ID do usuário ausente");
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new NotFound("Usuário não encontrado");
        }

        const productIds = items.map(i => i.productId);
        if (new Set(productIds).size !== productIds.length) {
            throw new Conflict("Produtos repetidos não são permitidos");
        }

        const foundProducts = await Product.findAll({ where: { id: productIds } });
        if (foundProducts.length !== productIds.length) {
            throw new NotFound("Alguns produtos não foram encontrados");
        }

        for (const item of items) {
            const product = foundProducts.find(p => p.id === item.productId);
            if (!product || item.quantity > product.quantity) {
                throw new Conflict(`Estoque insuficiente para o produto '${product?.name || 'desconhecido'}'`);
            }
        }

        const order = await Order.create({ userId });

        for (const item of items) {
            const product = foundProducts.find(p => p.id === item.productId);
            await OrderProduct.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity
            });
            await product.update({
                quantity: product.quantity - item.quantity
            });
        }

        const orderWithItems = await Order.findByPk(order.id, {
            include: {
                model: Product,
                as: 'products',
                through: { attributes: ['quantity'] }
            }
        });

        const orderLinks = [
            ...generateLinks("order", order.publicId, ["GET", "DELETE"]),
            { rel: "pay", method: "POST", href: `/api/orders/${order.publicId}/pay` }
        ];

        return res.status(201).json({
            message: "Pedido criado e aguardando pagamento.",
            order: {
                ...orderWithItems.toJSON(),
                _links: orderLinks
            }
        });
    }

    // static async create(req, res) {
    //     const { items } = req.body;
    //     const userId = req.userId;

    //     if (!Array.isArray(items) || items.length === 0) {
    //         throw new MissingValues({ items });
    //     }

    //     if (!userId) {
    //         throw new Conflict("ID do usuário ausente");
    //     }

    //     const user = await User.findByPk(userId);
    //     if (!user) {
    //         throw new NotFound("Usuário não encontrado");
    //     }

    //     const productIds = items.map(i => i.productId);

    //     if (new Set(productIds).size !== productIds.length) {
    //         throw new Conflict("Produtos repetidos não são permitidos");
    //     }

    //     const foundProducts = await Product.findAll({ where: { id: productIds } });

    //     if (foundProducts.length !== productIds.length) {
    //         throw new NotFound("Alguns produtos não foram encontrados");
    //     }

    //     for (const item of items) {
    //         const product = foundProducts.find(p => p.id === item.productId);
    //         if (!product || item.quantity > product.quantity) {
    //             throw new Conflict(`Estoque insuficiente para o produto '${product?.name || 'desconhecido'}'`);
    //         }
    //     }

    //     const order = await Order.create({ userId });

    //     for (const item of items) {
    //         const product = foundProducts.find(p => p.id === item.productId);

    //         await OrderProduct.create({
    //             orderId: order.id,
    //             productId: item.productId,
    //             quantity: item.quantity
    //         });

    //         await product.update({
    //             quantity: product.quantity - item.quantity
    //         });
    //     }

    //     const orderWithItems = await Order.findByPk(order.id, {
    //         include: {
    //             model: Product,
    //             through: { attributes: ['quantity'] }
    //         }
    //     });

    //     return res.status(201).json({
    //         message: "Pedido criado com sucesso",
    //         order: {
    //             ...orderWithItems.toJSON(),
    //             _links: generateLinks("order", order.id, ["GET", "DELETE"])
    //         }
    //     });
    // }

    static async delete(req, res) {
        const { publicId } = req.params;

        const order = await Order.findOne({
            where: { publicId },
            include: {
                model: Product,
                as: 'products',
                through: { attributes: ['quantity'] }
            }
        });

        if (!order) {
            throw new NotFound("Pedido não encontrado");
        }

        if (order.userId !== req.userId) {
            throw new Unauthorized("Você não tem permissão para cancelar este pedido");
        }

        if (order.paymentStatus === 'approved') {
            throw new Conflict("Não é possível cancelar um pedido que já foi pago.");
        }

        for (const product of order.products) {
            const orderedQty = product.order_products?.quantity;
            if (typeof orderedQty !== 'number') {
                throw new Conflict(`Erro ao restaurar estoque do produto '${product.name}'`);
            }
            product.quantity += orderedQty;
            await product.save();
        }

        await OrderProduct.destroy({ where: { orderId: order.id } });
        await Order.destroy({ where: { id: order.id } });

        return res.status(200).json({
            message: "Pedido cancelado e estoque restaurado com sucesso",
            _links: generateLinks("order", null, ["GET", "POST"])
        });
    }


    // static async delete(req, res) {
    //     const id = Number(req.params.id);

    //     const order = await Order.findByPk(id, {
    //         include: {
    //             model: Product,
    //             through: { attributes: ['quantity'] }
    //         }
    //     });

    //     if (!order) {
    //         throw new NotFound("Pedido não encontrado");
    //     }

    //     if (order.userId !== req.userId) {
    //         throw new Conflict("Você não tem permissão para cancelar este pedido");
    //     }

    //     for (const product of order.products) {
    //         const orderedQty = product.order_products?.quantity;

    //         if (typeof orderedQty !== 'number') {
    //             throw new Conflict(`Erro ao restaurar estoque do produto '${product.name}'`);
    //         }

    //         product.quantity += orderedQty;
    //         await product.save();
    //     }

    //     await OrderProduct.destroy({ where: { orderId: id } });
    //     await Order.destroy({ where: { id } });

    //     return res.json({
    //         message: "Pedido cancelado e estoque restaurado com sucesso",
    //         _links: generateLinks("order", null, ["GET", "POST"])
    //     });
    // }


};

module.exports = OrderController;