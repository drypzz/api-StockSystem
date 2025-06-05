const User = require("../models/User");
const bcrypt = require("bcrypt");

const MissingValues = require("../errors/missing-values");
const Conflict = require("../errors/conflict");
const EmailValidade = require("../errors/email-validate");

class RegisterController {
    static async register(req, res) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new MissingValues({ name, email, password });
        }

        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            throw new EmailValidade(email);
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Conflict("Email já cadastrado");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            message: "Usuário criado com sucesso",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
}

module.exports = RegisterController;