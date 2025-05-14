const database = require("../config/database");
const Category = require("./Category");

class Product {
    constructor() {
        this.model = database.db.define("product", {
            id: {
                type: database.db.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: database.db.Sequelize.STRING
            },
            price: {
                type: database.db.Sequelize.INTEGER
            },
            quantity: {
                type: database.db.Sequelize.INTEGER
            },
            description: {
                type: database.db.Sequelize.STRING
            },
            categoryId: {
                type: database.db.Sequelize.INTEGER,
                references: {
                    model: Category,
                    key: "id"
                },
            },
        });
    };
};

module.exports = (new Product).model;
