const { Order, Product, User } = require('../models');

const createTransporter = require('../config/email');

const database = require('../config/database');

/**
 * @function sendOrderConfirmation
 * @summary Envia um e-mail de confirmação de pedido de forma segura e idempotente.
 * @description Esta função realiza duas operações principais:
 * 1. **Transação Atômica:** Utiliza uma transação com 'lock' no banco de dados para verificar
 * se o e-mail já foi enviado e, em caso negativo, marca o pedido como notificado.
 * Isso previne o envio de múltiplos e-mails para o mesmo pedido em ambientes concorrentes.
 * 2. **Envio de E-mail:** Se a notificação for necessária, a função busca os detalhes completos
 * do pedido, monta um e-mail em HTML e o envia. A falha no envio do e-mail não reverte a
 * transação, garantindo que não haverá novas tentativas de envio.
 * @param {string|number} orderId - O ID do pedido a ser notificado.
*/
async function sendOrderConfirmation(orderId) {
    let orderData;

    // --- Bloco 1: Transação Atômica para Marcar o Pedido ---
    // Garante que a verificação e a atualização do status 'confirmationEmailSent'
    // ocorram como uma única operação, evitando condições de corrida.
    try {
        await database.db.transaction(async (t) => {
            const order = await Order.findByPk(orderId, {
                lock: t.LOCK.UPDATE,
                transaction: t,
                include: [{ model: User, as: 'user', required: true }]
            });

            if (!order || order.confirmationEmailSent) {
                orderData = null;
                return;
            }

            await order.update({ confirmationEmailSent: true }, { transaction: t });

            orderData = order.toJSON();
        });

    } catch (dbError) {
        console.error(`[NotificationService] FALHA na transação do banco para o pedido ${orderId}:`, dbError);
        return;
    }

    if (!orderData) {
        console.log(`[NotificationService] Envio de e-mail para o pedido ${orderId} não é necessário (já enviado ou pedido inválido).`);
        return;
    }

     // --- Bloco 2: Preparação e Envio do E-mail ---
    // Esta parte executa fora da transação. A falha aqui não afetará o banco.
    try {
        const fullOrder = await Order.findByPk(orderId, {
            include: [{ model: Product, as: 'products', required: true }]
        });

        const totalAmount = fullOrder.products.reduce((total, p) =>
            total + (p.price * p.order_products.quantity), 0
        );

        const productsListHtml = fullOrder.products.map((p) => `
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
            to: orderData.user.email,
            subject: `✅ Seu pedido #${orderData.id} foi confirmado!`,
            html: `
                <!DOCTYPE html>
                <html lang="pt-br">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
                        <title>Confirmação de Pagamento - Pedido #${orderData.id}</title>
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
                                                <p style="font-size: 16px; margin: 0 0 16px;">Olá, ${orderData.user.name},</p>
                                                <p style="font-size: 16px; margin: 0 0 24px;">Recebemos a confirmação de pagamento do seu <strong>pedido #${orderData.id}</strong>. Agradecemos pela sua compra!</p>

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
        await emailTransporter.sendMail(mailOptions);

        console.log(`[NotificationService] E-mail de confirmação para o pedido ${orderId} enviado com sucesso.`);

    } catch (emailError) {
        console.error(`[NotificationService] FALHA ao enviar o e-mail para o pedido ${orderId} (transação já foi commitada):`, emailError);
    }
}

module.exports = { sendOrderConfirmation };