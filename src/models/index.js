const Category = require("./Category");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const OrderProduct = require("./OrderProduct");

Order.belongsToMany(Product, { // Muitos para muitos
    through: OrderProduct, // Tabela intermediária
    foreignKey: "orderId", // Chave estrangeira na tabela OrderProduct
    otherKey: "productId" // Chave estrangeira na tabela Product
});
Product.belongsToMany(Order, { // Muitos para muitos
    through: OrderProduct, // Tabela intermediária
    foreignKey: "productId", // Chave estrangeira na tabela OrderProduct
    otherKey: "orderId" // Chave estrangeira na tabela Order
});

module.exports = { Category, Product, User, Order, OrderProduct };