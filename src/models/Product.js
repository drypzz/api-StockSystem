const database = require("../config/database");
const Category = require("./Category");

/**
 * @model Product
 * @summary Define o modelo 'Product' para a tabela de produtos.
 * @description Representa um item disponível para venda no catálogo. Contém
 * informações como nome, descrição, preço, quantidade em estoque e a qual
 * categoria pertence através da chave estrangeira 'categoryId'.
*/
const Product = database.db.define("product", {
    id: {
        type: database.db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: database.db.Sequelize.STRING
    },
    description: {
        type: database.db.Sequelize.STRING
    },
    price: {
        type: database.db.Sequelize.FLOAT
    },
    quantity: {
        type: database.db.Sequelize.INTEGER
    },
    categoryId: {
        type: database.db.Sequelize.INTEGER,
        references: {
            model: Category,
            key: "id"
        }
    }
});

module.exports = Product;
