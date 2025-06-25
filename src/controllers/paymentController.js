const { MercadoPagoConfig, Payment } = require('mercadopago');
const { Order, Product, User } = require("../models");
const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");
const Unauthorized = require("../errors/unauthorized");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

class PaymentController {

  static async getOrCreatePayment(req, res, next) {
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

      if (order.paymentId && order.paymentExpiresAt && new Date() < new Date(order.paymentExpiresAt)) {
        return res.status(200).json({
          publicOrderId: order.publicId,
          paymentId: order.paymentId,
          qrCode: order.paymentQrCode,
          qrCodeBase64: order.paymentQrCodeBase64,
          expiresAt: order.paymentExpiresAt,
        });
      }

      const totalAmount = order.products.reduce((total, product) => {
        const price = parseFloat(product.price);
        const quantity = product.order_products.quantity;
        return total + (price * quantity);
      }, 0);

      if (totalAmount <= 0) {
        throw new Conflict("O valor do pedido deve ser maior que zero.");
      }

      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 10);

      const nameParts = order.user.name.trim().split(' ');
      const firstName = nameParts.shift();
      const lastName = nameParts.length > 0 ? nameParts.join(' ') : firstName;

      const mercadopagoItems = order.products.map(product => ({
        id: String(product.id),
        title: product.name,
        description: product.description || `Item do pedido #${order.id}`,
        quantity: product.order_products.quantity,
        unit_price: Number(parseFloat(product.price).toFixed(2)),
        category_id: String(product.categoryId),
      }));

      const payment = new Payment(client);
      const paymentData = {
        transaction_amount: Number(totalAmount.toFixed(2)),
        description: `Pedido #${order.id} - E-commerce`,
        payment_method_id: 'pix',
        statement_descriptor: "STK | E-Commerce",
        external_reference: order.publicId,
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
        },
        additional_info: {
          items: mercadopagoItems
        },
        notification_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
        date_of_expiration: expirationDate.toISOString(),
      };

      const idempotencyKey = `order-payment-${order.id}`;

      const result = await payment.create({
        body: paymentData,
        requestOptions: { idempotencyKey }
      });

      await order.update({
        paymentId: String(result.id),
        paymentStatus: 'pending',
        paymentQrCode: result.point_of_interaction.transaction_data.qr_code,
        paymentQrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        paymentExpiresAt: result.date_of_expiration,
      });

      res.status(200).json({
        publicOrderId: order.publicId,
        paymentId: result.id,
        qrCode: result.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: result.point_of_interaction.transaction_data.qr_code_base64,
        expiresAt: result.date_of_expiration,
      });
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      next(error);
    }
  }

  static async handleWebhook(req, res, next) {
    try {
      const { body, query } = req;

      if (query.topic === 'payment' || query.type === 'payment') {
        const paymentId = body.data?.id || query.id;

        if (!paymentId) {
          return res.status(200).send('Webhook recebido, mas sem ID de pagamento.');
        }

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
    } catch (error) {
      console.error("Erro no webhook:", error);
      next(error);
    }
  }
}

module.exports = PaymentController;