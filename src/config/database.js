const Sequelize = require("sequelize");

/**
 * @class Database
 * @summary Classe singleton para gerenciar a conexão com o banco de dados.
 * @description Centraliza a configuração e inicialização do Sequelize.
 * Ela lê a URL de conexão do ambiente, estabelece a conexão com um banco
 * PostgreSQL e configura as opções de SSL necessárias para ambientes de produção na nuvem.
*/
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
                logging: false, // Desativa os logs de query do Sequelize no console.
                
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

// Exporta uma única instância da classe, garantindo uma única conexão.
module.exports = new Database();