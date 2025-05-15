const database = require("../config/database");
const Product = require("./Product");
const User = require("./User");
const OrderProduct = require("./OrderProduct");

const OrderModel = database.db.define("order", {
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

OrderModel.belongsToMany(Product, { through: OrderProduct });
Product.belongsToMany(OrderModel, { through: OrderProduct });

module.exports = OrderModel;