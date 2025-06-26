const Category = require("./Category");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const OrderProduct = require("./OrderProduct");

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, {
  as: "user",
  foreignKey: "userId",
});

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });

Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: "orderId",
  as: "products",
});
Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: "productId",
});

Order.hasMany(OrderProduct, {
  as: "order_products",
  foreignKey: "orderId",
});
OrderProduct.belongsTo(Order, {
  foreignKey: "orderId",
});

Product.hasMany(OrderProduct, {
  foreignKey: "productId",
});
OrderProduct.belongsTo(Product, {
  foreignKey: "productId",
});

module.exports = { Category, Product, User, Order, OrderProduct };
