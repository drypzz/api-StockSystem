const database = require("../config/database");

/**
 * @model Category
 * @summary Define o modelo 'Category' para a tabela 'categories' no banco de dados.
 * @description Este modelo Sequelize mapeia os campos da tabela de categorias.
 * - 'id': Chave primária, inteira e auto-incrementada.
 * - 'name': Nome da categoria, do tipo string.
 * O modelo é então exportado para ser utilizado nos controllers e serviços da aplicação.
*/
const Category = database.db.define("categories", {
    id: {
        type: database.db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: database.db.Sequelize.STRING
    },
});

module.exports = Category;