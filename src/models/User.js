const database = require("../config/database");

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