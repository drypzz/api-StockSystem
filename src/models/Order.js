const database = require("../config/database");
const Product = require("./Product");
const User = require("./User");
const OrderProduct = require("./OrderProduct");

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

Order.belongsToMany(Product, { through: OrderProduct });
Product.belongsToMany(Order, { through: OrderProduct });

module.exports = Order;