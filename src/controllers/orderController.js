const { MercadoPagoConfig, Payment } = require("mercadopago");
const { Order, Product, OrderProduct, User } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Unauthorized = require("../errors/unauthorized");
const Conflict = require("../errors/conflict");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

class OrderController {
  static async getAll(req, res) {
    const order = await Order.findAll();

    const response = order.map((order) => ({
      ...order.toJSON(),
      _links: generateLinks("order", order.publicId, ["GET", "DELETE"]),
    }));

    res.status(200).json({
      count: response.length,
      orders: response,
      _links: generateLinks("order", null, ["GET", "POST"]),
    });
  }

  static async getByID(req, res, next) {
    try {
      const { publicId } = req.params;
      const userId = req.userId;

      const order = await Order.findOne({
        where: { publicId },
        include: {
          model: Product,
          as: "products",
          through: { attributes: ["quantity"] },
        },
      });

      if (!order) {
        throw new NotFound("Pedido não encontrado");
      }
      if (order.userId !== userId) {
        throw new Unauthorized(
          "Você não tem permissão para vizualizar este pedido"
        );
      }

      res.status(200).json({
        ...order.toJSON(),
        _links: generateLinks("order", order.publicId, ["GET", "DELETE"]),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByUser(req, res, next) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new Unauthorized("ID do usuário ausente");
      }
      
      const userOrders = await Order.findAll({
        where: { userId },
        include: [{ model: OrderProduct, as: 'order_products' }],
        order: [['createdAt', 'DESC']],
      });

      if (!userOrders.length) {
        return res.status(200).json({ count: 0, order: [] });
      }

      const allProductIds = userOrders.flatMap(order =>
        order.order_products.map(op => op.productId)
      );

      const existingProducts = await Product.findAll({ where: { id: allProductIds } });
      const productsMap = new Map(existingProducts.map(p => [p.id, p.toJSON()]));

      const responseOrders = userOrders.map(order => {
        const rehydratedProducts = order.order_products.map(op => {
          const productData = productsMap.get(op.productId);
          
          if (productData) {
            return {
              ...productData,
              order_products: { quantity: op.quantity }
            };
          }
          return null;
        });

        const finalOrderObject = order.toJSON();
        delete finalOrderObject.order_products;

        return {
          ...finalOrderObject,
          order_products: order.toJSON().order_products,
          products: rehydratedProducts
        };
      });
      
      return res.status(200).json({
        count: responseOrders.length,
        order: responseOrders,
      });

    } catch(error) {
      next(error);
    }
  }

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

    const productIds = items.map((i) => i.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new Conflict("Produtos repetidos não são permitidos");
    }

    const foundProducts = await Product.findAll({ where: { id: productIds } });
    if (foundProducts.length !== productIds.length) {
      throw new NotFound("Alguns produtos não foram encontrados");
    }

    for (const item of items) {
      const product = foundProducts.find((p) => p.id === item.productId);
      if (!product || item.quantity > product.quantity) {
        throw new Conflict(
          `Estoque insuficiente para o produto '${
            product?.name || "desconhecido"
          }'`
        );
      }
    }

    const order = await Order.create({ userId });

    for (const item of items) {
      const product = foundProducts.find((p) => p.id === item.productId);
      await OrderProduct.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      });
      await product.update({
        quantity: product.quantity - item.quantity,
      });
    }

    const orderWithItems = await Order.findByPk(order.id, {
      include: {
        model: Product,
        as: "products",
        through: { attributes: ["quantity"] },
      },
    });

    const orderLinks = [
      ...generateLinks("order", order.publicId, ["GET", "DELETE"]),
      { rel: "pay", method: "POST", href: `/api/orders/${order.publicId}/pay` },
    ];

    return res.status(201).json({
      message: "Pedido criado e aguardando pagamento.",
      order: {
        ...orderWithItems.toJSON(),
        _links: orderLinks,
      },
    });
  }

  static async delete(req, res, next) {
    try {
      const { publicId } = req.params;

      const order = await Order.findOne({
        where: { publicId },
        include: {
          model: Product,
          as: "products",
          through: { attributes: ["quantity"] },
        },
      });

      if (!order) {
        throw new NotFound("Pedido não encontrado");
      }

      if (order.userId !== req.userId) {
        throw new Unauthorized(
          "Você não tem permissão para cancelar este pedido"
        );
      }

      if (order.paymentStatus === "approved") {
        throw new Conflict(
          "Não é possível cancelar um pedido que já foi pago."
        );
      }

      if (
        order.paymentId &&
        (order.paymentStatus === "pending" ||
          order.paymentStatus === "in_process")
      ) {
        try {
          const payment = new Payment(client);

          await payment.cancel({ id: order.paymentId });
        } catch (mpError) {
          console.error(
            `Erro ao tentar cancelar o pagamento ${order.paymentId} no Mercado Pago. O pedido local será cancelado mesmo assim. Detalhes:`,
            mpError
          );
        }
      }

      for (const product of order.products) {
        const orderedQty = product.order_products?.quantity;
        if (typeof orderedQty !== "number") {
          throw new Conflict(
            `Erro ao restaurar estoque do produto '${product.name}'`
          );
        }
        await product.increment("quantity", { by: orderedQty });
      }

      await OrderProduct.destroy({ where: { orderId: order.id } });
      await Order.destroy({ where: { id: order.id } });

      return res.status(200).json({
        message: "Pedido cancelado e estoque restaurado com sucesso.",
        _links: generateLinks("order", null, ["GET", "POST"]),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
