const express = require("express");
const router = express.Router();

const PaymentController = require("../controllers/paymentController");

const authMiddleware = require('../middlewares/auth.token');

router.post("/order/:publicId/pay", authMiddleware.token, PaymentController.getOrCreatePayment);

router.post("/payments/webhook", (req, res, next) => {
    try {
        PaymentController.handleWebhook(req, res);
    } catch(err) {
        next(err);
    }
});


module.exports = router;