const Category = require("./Category");
const Product = require("./Product");
const User = require("./User");
const Order = require("./Order");
const OrderProduct = require("./OrderProduct");

/**
 * @summary Define todas as associações (relacionamentos) entre os modelos.
 * @description Este arquivo centraliza a configuração das relações do banco de dados,
 * permitindo que o Sequelize execute consultas complexas com 'joins' de forma automática.
 * Relações definidas:
 * - User (1) -> (N) Order: Um usuário pode ter vários pedidos.
 * - Category (1) -> (N) Product: Uma categoria pode ter vários produtos.
 * - Order (N) <-> (M) Product: Um pedido pode ter vários produtos, e um produto pode
 * estar em vários pedidos. A relação é feita através da tabela 'OrderProduct'.
*/

// Relação 1-N: User -> Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { as: "user", foreignKey: "userId" });

// Relação 1-N: Category -> Product
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });

// Relação N-M: Order <-> Product
Order.belongsToMany(Product, {
  through: OrderProduct, // Tabela intermediária
  foreignKey: "orderId",
  as: "products",
});
Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: "productId",
});

// Relações explícitas com a tabela de junção (opcional, mas bom para clareza)
Order.hasMany(OrderProduct, { as: "order_products", foreignKey: "orderId" });
OrderProduct.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderProduct, { foreignKey: "productId" });
OrderProduct.belongsTo(Product, { foreignKey: "productId" });

module.exports = { Category, Product, User, Order, OrderProduct };
