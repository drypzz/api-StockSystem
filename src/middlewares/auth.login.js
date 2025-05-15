const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class LoginController {

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Verifica se os campos obrigatórios estão presentes
            if (!email || !password) {
                return res.status(400).json({ message: "Email e senha são obrigatórios" });
            };

            // Verifica se o email existe
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado" });
            };

            // Verifica se a senha está correta
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Senha inválida" });
            };

            // Gera o token JWT
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "drypzz", { expiresIn: "1h" });

            res.json({ message: "Login realizado com sucesso", token });
        } catch (error) {
            res.status(500).json({ message: "Erro ao autenticar usuário", error: error.message });
        };
    };

};

module.exports = LoginController;