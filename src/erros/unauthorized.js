class Unauthorized extends Error {
    constructor(message = "Não autorizado"){
        super(message)
        this.statusCode = 401
    };
};

module.exports = Unauthorized;