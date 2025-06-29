const Sequelize = require("sequelize");

class Database {
    constructor() {
        this.init(); // Inicializa a conexão com o banco de dados
    }

    init() {
        // Valida se a DATABASE_URL foi definida no arquivo .env
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL não foi definida nas variáveis de ambiente.");
        }

        // Cria a conexão com o banco de dados usando a URL do Supabase
        this.db = new Sequelize(
            process.env.DATABASE_URL, // Passa a string de conexão completa
            {
                dialect: 'postgres', // Informa que estamos usando PostgreSQL
                protocol: 'postgres',
                logging: false, // Desabilita os logs de query no console
                
                // Opções específicas para o dialeto PostgreSQL
                dialectOptions: {
                    ssl: {
                        require: true, // Exige conexão SSL
                        rejectUnauthorized: false // Essencial para evitar erros de certificado com Supabase/Render
                    }
                },
            }
        );
    }
}

module.exports = new Database();