const Sequelize = require("sequelize");

class Database {
    constructor() {
        this.init();
    }

    init() {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL não foi definida nas variáveis de ambiente.");
        }

        this.db = new Sequelize(
            process.env.DATABASE_URL,
            {
                dialect: 'postgres',
                protocol: 'postgres',
                logging: false,
                
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                },
            }
        );
    }
}

module.exports = new Database();