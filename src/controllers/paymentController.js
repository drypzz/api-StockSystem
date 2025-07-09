const qrcode = require("qrcode");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

const { MercadoPagoConfig, Payment } = require("mercadopago");
const { Order, Product, User } = require("../models");
const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");
const Unauthorized = require("../errors/unauthorized");

const { sendOrderConfirmation } = require('../services/notificationService');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

/**
 * @class PaymentController
 * @summary Gerencia a criação de pagamentos e o recebimento de notificações (webhooks) do gateway.
*/
class PaymentController {

  /**
   * @method getOrCreatePayment
   * @summary Gera ou obtém os dados de pagamento para um pedido.
   * @description Método idempotente. Se já existe um pagamento válido, o retorna.
   * Caso contrário, cria uma nova transação PIX no Mercado Pago, gera um QR Code
   * customizado com logo e salva as informações no pedido.
  */
  static async getOrCreatePayment(req, res, next) {
    try {
      const { publicId } = req.params;
      const userId = req.userId;

      const order = await Order.findOne({
        where: { publicId },
        include: [
          {
            model: Product,
            as: "products",
            through: { attributes: ["quantity"] },
          },
          { model: User, as: "user", attributes: ["email", "name"] },
        ],
      });

      if (!order) {
        throw new NotFound("Pedido não encontrado");
      }

      if (!order.user) {
        throw new Error("Falha ao carregar os dados do usuário para o pedido.");
      }

      if (order.userId !== userId) {
        throw new Unauthorized(
          "Você não tem permissão para pagar este pedido."
        );
      }
      if (order.paymentStatus === "approved") {
        throw new Conflict("Este pedido já foi pago.");
      }

      const totalAmount = order.products.reduce((total, product) => {
        const price = parseFloat(product.price);
        const quantity = product.order_products.quantity;
        return total + price * quantity;
      }, 0);

      if (order.paymentId && order.paymentExpiresAt && new Date() < new Date(order.paymentExpiresAt)) {
        return res.status(200).json({
          publicOrderId: order.publicId,
          paymentId: order.paymentId,
          qrCode: order.paymentQrCode,
          qrCodeBase64: order.paymentQrCodeBase64,
          expiresAt: order.paymentExpiresAt,
          amount: totalAmount,
        });
      }

      if (totalAmount <= 0) {
        throw new Conflict("O valor do pedido deve ser maior que zero.");
      }

      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 20);

      const nameParts = order.user.name.trim().split(" ");
      const firstName = nameParts.shift();
      const lastName = nameParts.length > 0 ? nameParts.join(" ") : firstName;

      const mercadopagoItems = order.products.map((product) => ({
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
        payment_method_id: "pix",
        statement_descriptor: "STK | E-Commerce",
        external_reference: order.publicId,
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
        },
        additional_info: {
          items: mercadopagoItems,
        },
        notification_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
        date_of_expiration: expirationDate.toISOString(),
      };

      const idempotencyKey = `order-payment-${order.id}`;

      const result = await payment.create({
        body: paymentData,
        requestOptions: { idempotencyKey },
      });

      const brcode = result.point_of_interaction.transaction_data.qr_code;

      const logoPath = path.resolve(
        __dirname,
        "..",
        "..",
        "assets",
        "logo.png"
      );

      const logoBuffer = await fs.readFile(logoPath);

      const qrCodeBuffer = await qrcode.toBuffer(brcode, {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 10,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const qrCodeMetadata = await sharp(qrCodeBuffer).metadata();
      const qrCodeWidth = qrCodeMetadata.width;

      const logoWidth = Math.floor(qrCodeWidth * 0.25);

      const resizedLogoBuffer = await sharp(logoBuffer).resize({ width: logoWidth }).toBuffer();

      const qrCodeComLogoBuffer = await sharp(qrCodeBuffer).composite([{
        input: resizedLogoBuffer,
        gravity: "center",
      },]).toBuffer();

      const qrCodeComLogoBase64 = `data:image/png;base64,${qrCodeComLogoBuffer.toString("base64")}`;

      await order.update({
        paymentId: String(result.id),
        paymentStatus: "pending",
        paymentQrCode: brcode,
        paymentQrCodeBase64: qrCodeComLogoBase64,
        paymentExpiresAt: result.date_of_expiration,
      });

      res.status(200).json({
        publicOrderId: order.publicId,
        paymentId: result.id,
        qrCode: brcode,
        qrCodeBase64: qrCodeComLogoBase64,
        expiresAt: result.date_of_expiration,
        amount: totalAmount,
      });
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      if (error.cause) {
        console.error("Detalhes do erro do Mercado Pago:", JSON.stringify(error.cause, null, 2));
      }
      next(error);
    }
  }

  /**
   * @method handleWebhook
   * @summary Recebe e processa notificações de pagamento do Mercado Pago.
   * @description Quando um pagamento é aprovado, este método atualiza o status do pedido
   * no banco de dados e dispara o serviço de notificação para enviar o e-mail de confirmação.
  */
  static async handleWebhook(req, res, next) {
    try {
      const { body, query } = req;

      if (query.topic === "payment" || query.type === "payment") {
        const paymentId = body.data?.id || query.id;

        if (!paymentId) {
          return res.status(200).send("Webhook recebido, mas sem ID de pagamento.");
        }

        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });

        const order = await Order.findOne({
          where: { paymentId: String(paymentId) },
          include: [
            { model: User, as: 'user', attributes: ['name', 'email'] },
            {
              model: Product,
              as: 'products',
              attributes: ['name', 'price'],
              through: { attributes: ['quantity'] }
            }
          ]
        });

        if (order && paymentInfo) {
          if (paymentInfo.status === "approved") {
            await order.update({ paymentStatus: paymentInfo.status });
            await sendOrderConfirmation(order.id);
          }
        }
      }

      res.status(200).send("Webhook recebido");
    } catch (error) {
      console.error("Erro no webhook:", error);
      next(error);
    }
  }
}

module.exports = PaymentController;