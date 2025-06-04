const Sequelize = require("sequelize");
require("dotenv").config();

class Database {
    
    constructor() {
        this.init(); // Inicializa a conexão com o banco de dados
    };

    init() { // Cria a conexão com o banco de dados
        this.db = new Sequelize(
            (process.env.DATABASE_NAME || "database"),
            (process.env.DATABASE_USER || "root"),
            (process.env.DATABASE_PASSWORD || ""),
            { host: (process.env.DATABASE_HOST || "localhost"), logging: false, dialect: (process.env.DATABASE_ENGINE || "mysql") },
        );
    };
};

module.exports = new Database();