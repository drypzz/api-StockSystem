const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const TokenController = require("../middlewares/auth.token");

router.use(TokenController.token);
router.get("/order", orderController.getAll);
router.get("/order/:id", orderController.getByID);
router.post("/order", orderController.create);
router.delete("/order/:id", orderController.delete);

module.exports = router;