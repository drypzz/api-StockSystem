const User = require("../models/User");
const bcrypt = require("bcrypt");

const MissingValues = require("../erros/missing-values");
const Conflict = require("../erros/conflict");
const EmailValidade = require("../erros/email-validate");

class RegisterController {

    static async register(req, res) {
        const { name, email, password } = req.body;

        // Verifica se os campos obrigatórios estão presentes
        if (!name || !email || !password) {
            throw new MissingValues({ name, email, password});
        };
        
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            throw new EmailValidade(email);
        };

        // Verifica se o email já esta cadastrado
        const findEmail = await User.findOne({ where: { email } });
        if (findEmail) {
            throw new Conflict(`Email já cadastrado`)
        };
        
        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o usuario
        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({ message: "Usuario criado com sucesso", newUser });
    };

};

module.exports = RegisterController;