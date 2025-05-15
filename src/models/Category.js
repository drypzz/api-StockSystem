const database = require("../config/database");

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