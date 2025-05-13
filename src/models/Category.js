const database = require("../config/database");

class Category {
    constructor() {
        this.model = database.db.define("category", {
            id: {
                type: database.db.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: database.db.Sequelize.STRING
            },
        });
    };
};

module.exports = (new Category).model;