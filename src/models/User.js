const database = require("../config/database");

/**
 * @model User
 * @summary Define o modelo 'User' para a tabela de usuários.
 * @description Representa um usuário do sistema, armazenando suas informações
 * básicas de identificação e credenciais de acesso, como nome, e-mail e a
 * senha (que deve ser armazenada como um hash).
*/
const User = database.db.define("user", {
    id: {
        type: database.db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: database.db.Sequelize.STRING
    },
    email: {
        type: database.db.Sequelize.STRING
    },
    password: {
        type: database.db.Sequelize.STRING
    },
});

module.exports = User;