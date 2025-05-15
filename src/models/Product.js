const database = require("../config/database");
const Category = require("./Category");

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
