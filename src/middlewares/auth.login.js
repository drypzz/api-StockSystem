const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class LoginController {

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Senha inválida" });
            };

            const token = jwt.sign({ id: user.id }, "drypzz", { expiresIn: "1h" });

            res.json({ message: "Login realizado com sucesso", token });
        } catch (error) {
            res.status(500).json({ message: "Erro ao autenticar usuário", error: `${error.message}` });
        };
    };

};

module.exports = LoginController;