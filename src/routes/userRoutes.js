const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/user", userController.getAll);
router.get("/user/:id", userController.getByID);
// router.post("/user", userController.create);
router.put("/user/:id", userController.update);
router.delete("/user/:id", userController.delete);

module.exports = router;