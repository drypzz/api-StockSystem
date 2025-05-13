const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.get("/product", productController.getAll);
router.get("/product/:id", productController.getByID);
router.post("/product", productController.create);
router.put("/product/:id", productController.update);
router.delete("/product/:id", productController.delete);

module.exports = router;