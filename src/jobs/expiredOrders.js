const cron = require('node-cron');
const { Order, Product } = require('../models');
const { Op } = require('sequelize');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const payment = new Payment(client);

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