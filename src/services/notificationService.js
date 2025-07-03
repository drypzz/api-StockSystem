const { Order, Product, User } = require('../models');

const createTransporter = require('../config/email');

const database = require('../config/database');

async function sendOrderConfirmation(orderId) {
    try {
        const result = await database.db.transaction(async (t) => {
            const order = await Order.findByPk(orderId, {
                lock: t.LOCK.UPDATE,
                transaction: t,
                include: [
                    { model: User, as: 'user', required: true },
                    { model: Product, as: 'products', required: true }
                ]
            });

            if (!order) return;

            if (order.confirmationEmailSent) return;

            const totalAmount = order.products.reduce((total, p) =>
                total + (p.price * p.order_products.quantity), 0
            );

            const productsListHtml = order.products.map((p) => `
                <tr>
                    <td style="padding: 12px 8px; border-bottom: 1px solid #334155; color: #f1f5f9; font-size: 14px;">
                        <strong>${p.name}</strong><br>
                        <span style="color: #94a3b8; font-size: 13px;">Qtd: ${p.order_products.quantity}</span>
                    </td>
                    <td style="padding: 12px 8px; border-bottom: 1px solid #334155; text-align: right; color: #86efac; font-weight: bold; font-size: 14px;">
                        R$ ${(p.price * p.order_products.quantity).toFixed(2)}
                    </td>
                </tr>
            `
            ).join('');

            const mailOptions = {
                from: `"STK | E-Commerce" <contact@stksystem.shop>`,
                to: order.user.email,
                subject: `✅ Seu pedido #${order.id} foi confirmado!`,
                html: `
                    <!DOCTYPE html>
                    <html lang="pt-br">
                        <head>
                            <meta charset="UTF-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
                            <title>Confirmação de Pagamento - Pedido #${order.id}</title>
                        </head>
                        <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0f172a; padding: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #1e293b; border: 1px solid #334155;">
                                            <tr>
                                                <td style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #334155;">
                                                    <img src="https://api.stksystem.shop/assets/transparent.png" alt="STK System" width="120" style="display: block;">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 32px; color: #cbd5e1;">
                                                    <h1 style="font-size: 28px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px;">Pagamento Confirmado!</h1>
                                                    <p style="font-size: 16px; margin: 0 0 16px;">Olá, ${order.user.name},</p>
                                                    <p style="font-size: 16px; margin: 0 0 24px;">Recebemos a confirmação de pagamento do seu <strong>pedido #${order.id}</strong>. Agradecemos pela sua compra!</p>

                                                    <h2 style="font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 1px solid #334155;">Resumo da Compra</h2>

                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                                                        ${productsListHtml}
                                                        <tr>
                                                            <td style="padding: 16px 8px; text-align: left; font-size: 16px; font-weight: 700; color: #f1f5f9;">Total</td>
                                                            <td style="padding: 16px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #86efac;">R$ ${totalAmount.toFixed(2)}</td>
                                                        </tr>
                                                    </table>

                                                    <div style="text-align: center; margin: 40px 0;">
                                                        <a href="https://www.stksystem.shop/orders" target="_blank" style="background-color: #38bdf8; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Ver Meus Pedidos</a>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="background-color: #0f172a; border-top: 1px solid #334155; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
                                                    <p style="margin: 0;">Em caso de dúvidas, entre em contato com nosso suporte.</p>
                                                    <p style="margin: 8px 0 0;">STK &copy; ${new Date().getFullYear()} Todos os direitos reservados.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                    </html>
                `,
            };

            const emailTransporter = await createTransporter();

            try{
                await emailTransporter.sendMail(mailOptions);
    
                await order.update({ confirmationEmailSent: true });
            }catch(error){
                console.error(`[NotificationService] Erro ao enviar email`, error)
            }
        })

    } catch (error) {
        console.error(`[NotificationService] FALHA na transação para o pedido ${orderId}:`, error);
    }
}

module.exports = { sendOrderConfirmation };