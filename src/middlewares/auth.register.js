const User = require("../models/User");
const bcrypt = require("bcrypt");

class RegisterController {

    static async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Verifica se os campos obrigatórios estão presentes
            if (!name || !email || !password) {
                return res.status(400).json({ message: "Todos os campos sao obrigatórios" });
            };

            // Verifica se o email já esta cadastrado
            const findEmail = await User.findOne({ where: { email } });
            if (findEmail) {
                return res.status(400).json({ message: "Email ja registrado" });
            };
            
            // Criptografa a senha
            const hashedPassword = await bcrypt.hash(password, 10);

            // Cria o usuario
            const newUser = await User.create({ name, email, password: hashedPassword });

            res.status(201).json({ message: "Usuario criado com sucesso", newUser });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar usuario", error: error.message });
        };
    };

};

module.exports = RegisterController;