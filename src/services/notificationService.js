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

            if (!order || order.paymentStatus !== 'approved' || order.confirmationEmailSent) {
                return; 
            }

            const totalAmount = order.products.reduce((total, p) =>
                total + (p.price * p.order_products.quantity), 0
            );
    
            const productsListHtml = order.products.map(p =>
                `<div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #334155; font-size: 14px;">
                    <div style="flex: 3;">
                        <span style="font-weight: 500; color: #f1f5f9;">${p.name}</span><br>
                        <span style="font-size: 13px; color: #94a3b8;">Qtd: ${p.order_products.quantity}</span>
                    </div>
                    <div style="flex: 1; text-align: right; font-weight: bold; font-size: 16px; color: #86efac;">
                        R$ ${(p.price * p.order_products.quantity).toFixed(2)}
                    </div>
                </div>`
            ).join('');
    
            const mailOptions = {
                from: `"STK | E-Commerce" <noreply@stksystem.com>`,
                to: order.user.email,
                subject: `✅ Seu pedido #${order.id} foi confirmado!`,
                html: `
                    <!DOCTYPE html>
                    <html lang="pt-br">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
                            <title>Confirmação de Pagamento - Pedido #${order.id}</title>
                        </head>
                        <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
                            <div style="max-width: 600px; margin: 40px auto; background-color: #1e293b; border: 1px solid #334155; overflow: hidden;">
                                
                                <div style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #334155;">
                                    <img src="https://stocksystem-464322.rj.r.appspot.com/assets/transparent.png" alt="Logo STK System" width="120" style="display: block; margin: 0 auto;">
                                </div>
    
                                <div style="padding: 32px; color: #cbd5e1; line-height: 1.6;">
                                    <h1 style="font-size: 28px; font-weight: 700; color: #f1f5f9; margin-top: 0; margin-bottom: 24px;">Pagamento Confirmado!</h1>
                                    <p style="font-size: 16px; margin-bottom: 24px;">Olá, ${order.user.name},</p>
                                    <p style="font-size: 16px; margin-bottom: 24px;">Recebemos a confirmação de pagamento do seu <strong>pedido #${order.id}</strong>. Agradecemos pela sua compra!</p>
                                    
                                    <div style="margin: 32px 0;">
                                        <h2 style="font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #334155;">Resumo da Compra</h2>
                                        ${productsListHtml}
                                    </div>
    
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-top: 24px;">
                                        <span style="font-size: 18px; font-weight: 700; color: #f1f5f9;">Total</span>
                                        <span style="font-size: 22px; font-weight: bold; color: #86efac;">R$ ${totalAmount.toFixed(2)}</span>
                                    </div>
    
                                    <div style="text-align: center; margin: 40px 0 16px 0;">
                                        <a href="https://stksystem.vercel.app/orders" target="_blank" style="background-color: #38bdf8; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Ver Meus Pedidos</a>
                                    </div>
                                </div>
    
                                <div style="background-color: #0f172a; border-top: 1px solid #334155; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
                                    <p style="margin: 0;">Em caso de dúvidas, entre em contato com nosso suporte.</p>
                                    <p style="margin-top: 8px; margin-bottom: 0;">STK &copy; ${new Date().getFullYear()} Todos os direitos reservados.</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `,
            };
    
            const emailTransporter = await createTransporter();
            await emailTransporter.sendMail(mailOptions);
    
            await order.update({ confirmationEmailSent: true });
        })

    } catch (error) {
        console.error(`[NotificationService] FALHA na transação para o pedido ${orderId}:`, error);
    }
}

module.exports = { sendOrderConfirmation };