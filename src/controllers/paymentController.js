const { MercadoPagoConfig, Payment } = require('mercadopago');
const { Order, Product, User } = require("../models");
const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");
const { where } = require('sequelize');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

class PaymentController {

  static async createPayment(req, res, next) {
    try {
      const { publicId } = req.params;
      const userId = req.userId;

      const order = await Order.findOne({
        where: { publicId },
        include: [
          { model: Product, as: 'products', through: { attributes: ['quantity'] } },
          { model: User, as: 'user', attributes: ['email', 'name'] }
        ]
      });

      if (!order) {
        throw new NotFound("Pedido não encontrado");
      }

      if (!order.user) {
        throw new Error("Falha ao carregar os dados do usuário para o pedido.");
      }

      if (order.userId !== userId) {
        throw new Unauthorized("Você não tem permissão para pagar este pedido.");
      }
      if (order.paymentStatus === 'approved') {
        throw new Conflict("Este pedido já foi pago.");
      }

      const totalAmount = order.products.reduce((total, product) => {
        const price = parseFloat(product.price);
        const quantity = product.order_products.quantity;
        return total + (price * quantity);
      }, 0);

      if (totalAmount <= 0) {
        throw new Conflict("O valor do pedido deve ser maior que zero.");
      }

      const payment = new Payment(client);
      const paymentData = {
        transaction_amount: Number(totalAmount.toFixed(2)),
        description: `Pedido #${order.id} - E-commerce`,
        payment_method_id: 'pix',
        payer: {
          email: order.user.email,
          first_name: order.user.name,
        },
        notification_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
      };

      const result = await payment.create({
        body: paymentData,
        requestOptions: {
          idempotencyKey: `order-${order.id}-${Date.now()}`
        }
      });

      await order.update({ paymentId: String(result.id) });
      res.status(200).json({
        publicOrderId: order.publicId,
        paymentId: result.id,
        paymentStatus: result.status,
        qrCode: result.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async handleWebhook(req, res) {
    const { body, query } = req;

    if (query.topic === 'payment' || query.type === 'payment') {
      const paymentId = body.data?.id || query.id;

      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      const order = await Order.findOne({ where: { paymentId: String(paymentId) } });

      if (order && paymentInfo) {
        await order.update({ paymentStatus: paymentInfo.status });

        if (paymentInfo.status === 'approved') {
          console.log(`Pagamento do pedido ${order.id} APROVADO!`);
        }
      }
    }

    res.status(200).send('Webhook recebido');
  }
}

module.exports = PaymentController;