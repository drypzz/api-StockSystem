const database = require("../config/database");
const User = require("./User");

const Order = database.db.define("order", {
    id: {
        type: database.db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: database.db.Sequelize.INTEGER,
        references: {
            model: User,
            key: "id"
        },
    },
});

module.exports = Order;