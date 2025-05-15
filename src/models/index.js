const Sequelize = require("sequelize");
const database = require("../config/database");

const db = database.db;

// Carrega os models SEM fazer relacionamentos ainda
const Category = require("./Category");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const OrderProduct = require("./OrderProduct");

// Associações (executadas só depois de todos os models estarem carregados)
Product.belongsTo(Category, { foreignKey: "categoryId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: "orderId",
    otherKey: "productId"
});
Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: "productId",
    otherKey: "orderId"
});

module.exports = {
    db,
    Sequelize,
    Category,
    Product,
    User,
    Order,
    OrderProduct
};
