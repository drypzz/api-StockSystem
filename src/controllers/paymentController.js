const qrcode = require("qrcode");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const { MercadoPagoConfig, Payment } = require("mercadopago");
const { Order, Product, User } = require("../models");
const NotFound = require("../errors/not-found");
const Conflict = require("../errors/conflict");
const Unauthorized = require("../errors/unauthorized");

const createTransporter = require("../config/email");

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

      const logoBuffer = fs.readFileSync(logoPath);

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
          await order.update({ paymentStatus: paymentInfo.status });

          if (paymentInfo.status === "approved" && !order.confirmationEmailSent) {

            const totalAmount = order.products.reduce((total, p) =>
              total + (p.price * p.order_products.quantity), 0
            );

            const productsRows = order.products.map(p =>
              `<tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #dddddd; text-align: left;">${p.name}</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #dddddd; text-align: center;">${p.order_products.quantity}</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #dddddd; text-align: right;">R$ ${parseFloat(p.price).toFixed(2)}</td>
              </tr>`
            ).join('');

            const mailOptions = {
              from: `"STK | E-Commerce" <noreply@stksystem.com>`,
              to: order.user.email,
              subject: `✅ Seu pedido #${order.id} foi confirmado!`,
              html: `
              <!DOCTYPE html>
              <html lang="pt-br">
                <head>
                    <meta charset="UTF-M-d">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmação de Pagamento - Pedido #${order.id}</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                        table { border-collapse: collapse; }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f2f2f2;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f2f2f2">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                    
                                    <tr>
                                        <td align="center" style="padding: 20px 0; background-color: #2c3e50;">
                                            <img src="https://stocksystem-464322.rj.r.appspot.com/assets/transparent.png" alt="Logo STK System" width="150" style="display: block;">
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 40px 30px; font-family: Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.6;">
                                            <h1 style="font-size: 24px; color: #2c3e50; margin-top: 0;">Olá, ${order.user.name}!</h1>
                                            <p>Ótima notícia! Confirmamos o pagamento do seu <strong>pedido #${order.id}</strong>.</p>
                                            <p>Já estamos preparando tudo para o envio e você será notificado assim que seu pacote estiver a caminho.</p>
                                            
                                            <h2 style="font-size: 20px; color: #2c3e50; border-top: 1px solid #eeeeee; padding-top: 20px; margin-top: 30px;">Resumo do Pedido</h2>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                                <thead>
                                                    <tr>
                                                        <th style="padding: 10px 15px; border-bottom: 2px solid #2c3e50; text-align: left; color: #2c3e50;">Produto</th>
                                                        <th style="padding: 10px 15px; border-bottom: 2px solid #2c3e50; text-align: center; color: #2c3e50;">Qtd.</th>
                                                        <th style="padding: 10px 15px; border-bottom: 2px solid #2c3e50; text-align: right; color: #2c3e50;">Preço</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${productsRows}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #333333; border-top: 2px solid #eeeeee;">Valor Total:</td>
                                                        <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #333333; border-top: 2px solid #eeeeee;">R$ ${totalAmount.toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>

                                            <table border="0" cellspacing="0" cellpadding="0" width="100%">
                                                <tr>
                                                    <td align="center" style="padding: 20px 0;">
                                                        <a href="https://stksystem.vercel.app/orders" target="_blank" style="background-color: #3498db; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Ver meu pedido(s)</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" style="padding: 20px 30px; background-color: #ecf0f1; color: #7f8c8d; font-family: Arial, sans-serif; font-size: 12px;">
                                            <p>STK &copy; 2025 - ${new Date().getFullYear()}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
              </html>`,
            };

            try {
              const emailTransporter = await createTransporter();
              await emailTransporter.sendMail(mailOptions);

              await order.update({ confirmationEmailSent: true });

            } catch (emailError) {
              console.error("Falha ao enviar e-mail de confirmação:", emailError);
            }
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