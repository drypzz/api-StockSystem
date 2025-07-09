const cron = require('node-cron');
const { Order, Product } = require('../models');
const { Op } = require('sequelize');
const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configura o cliente da API do Mercado Pago.
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const payment = new Payment(client);

/**
 * @summary Job agendado (cron job) para gerenciar pedidos com pagamento expirado.
 * @description Este script executa a cada minuto ('* * * * *') para automatizar a
 * limpeza de pedidos pendentes que não foram pagos a tempo.
 * O processo consiste em:
 * 1. Buscar todos os pedidos com status 'pending' cuja data de expiração já passou.
 * 2. Para cada pedido encontrado:
 * a. Cancela o pagamento correspondente na API do Mercado Pago.
 * b. Atualiza o status do pedido no banco de dados para 'cancelled'.
 * c. Devolve os produtos do pedido de volta ao estoque, incrementando a quantidade.
 * 3. Loga eventuais erros que ocorram durante o processo para depuração.
*/
cron.schedule('* * * * *', async () => {
    try {
        const expiredOrders = await Order.findAll({
            where: {
                paymentStatus: 'pending',
                paymentExpiresAt: { [Op.lt]: new Date() }
            },
            include: [{ model: Product, as: 'products' }]
        });

        if (expiredOrders.length === 0) {
            return;
        }

        for (const order of expiredOrders) {

            await payment.cancel({ id: order.paymentId });
            await order.update({ paymentStatus: 'cancelled' });

            for (const product of order.products) {
                const orderedQty = product.order_products.quantity;
                await product.increment('quantity', { by: orderedQty });
            }
        }
    } catch (error) {
        console.error('[CRON JOB] Erro ao processar pedidos expirados:', error);
    }
});