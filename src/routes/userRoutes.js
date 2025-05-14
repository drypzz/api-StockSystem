const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const TokenController = require("../middlewares/auth.token");
const create = require("../middlewares/auth.register");

router.use(TokenController.token);
router.get("/user", userController.getAll);
router.get("/user/:id", userController.getByID);
router.post("/user", create.register);
router.put("/user/:id", userController.update);
router.delete("/user/:id", userController.delete);

module.exports = router;