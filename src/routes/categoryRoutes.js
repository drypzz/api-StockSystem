const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

router.get("/category", categoryController.getAll);
router.get("/category/:id", categoryController.getByID);
router.post("/category", categoryController.create);
router.put("/category/:id", categoryController.update);
router.delete("/category/:id", categoryController.delete);

module.exports = router;