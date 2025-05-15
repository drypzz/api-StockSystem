const jwt = require("jsonwebtoken");
require("dotenv").config();

class TokenController {
    
    static token(req, res, next) {
        const token = req.headers.authorization;
        
        // Verifca se o token existe
        if (!token) {
            return res.status(401).json({ message: "Acesso negado!" });
        };
        
        // Se o token existir, verifica se ele é válido
        try {
            const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "drypzz");
            req.userId = decoded.id;
            next();
        } catch (error) {
            res.status(403).json({ message: "Token inválido!", error: error.message });
        };
    };

};

module.exports = TokenController;