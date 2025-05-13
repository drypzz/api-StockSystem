const database = require("../config/database");
const Product = require("./Product");
const User = require("./User");

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

OrderModel.belongsToMany(Product, { through: 'order_products' });
Product.belongsToMany(OrderModel, { through: 'order_products' });

module.exports = OrderModel;