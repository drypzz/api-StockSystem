// models/index.js (ou seu arquivo central de associações)

const Category = require("./Category");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const OrderProduct = require("./OrderProduct");

// User <-> Order (Um usuário tem muitos pedidos, um pedido pertence a um usuário)
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { 
    as: 'user', // CORREÇÃO: Adicione um alias explícito (ex: 'user' em minúsculo)
    foreignKey: "userId" 
});

// Category <-> Product 
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { as: 'category', foreignKey: "categoryId" });

// Order <-> Product
Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: "orderId",
    as: 'products' 
});
Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: "productId",
});


module.exports = { Category, Product, User, Order, OrderProduct };