const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/paymentController");

const authMiddleware = require('../middlewares/auth.token');

// Inicia o processo de pagamento para um pedido específico
router.post("/order/:id/pay", authMiddleware.token, (req, res, next) => {
    try {
        PaymentController.createPayment(req, res);
    } catch(err) {
        next(err);
    }
});

// Rota para o Webhook do Mercado Pago (não precisa de autenticação)
router.post("/payments/webhook", (req, res, next) => {
    try {
        PaymentController.handleWebhook(req, res);
    } catch(err) {
        next(err);
    }
});


module.exports = router;