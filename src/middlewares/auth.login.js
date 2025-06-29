const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Unauthorized = require("../errors/unauthorized");
const MissingValues = require("../errors/missing-values");
const NotFound = require("../errors/not-found");

class LoginController {
    static async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new MissingValues({ email, password });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new NotFound("Usuário com este email não foi encontrado");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Unauthorized("Senha incorreta");
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.json({
            message: "Login realizado com sucesso",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    };
};

module.exports = LoginController;
