const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Unauthorized = require("../errors/unauthorized");
const MissingValues = require("../errors/missing-values");
const NotFound = require("../errors/not-found");

require("dotenv").config();

class LoginController {

    static async login(req, res) {
        const { email, password } = req.body;

        // Verifica se os campos obrigatórios estão presentes
        if (!email || !password) {
            throw new MissingValues({ email, password })
        };

        // Verifica se o email existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new NotFound("Usuario não encontrado")
        };

        // Verifica se a senha está correta
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Unauthorized("Senha invalida")
        };

        // Gera o token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "drypzz", { expiresIn: "1H" });

        res.json({ message: "Login realizado com sucesso", token });
    };

};

module.exports = LoginController;