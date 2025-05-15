const database = require("../config/database");
const Order = require("./Order");
const Product = require("./Product");

const OrderProduct = database.db.define("order_products", {
    orderId: {
        type: database.db.Sequelize.INTEGER,
        references: {
            model: Order,
            key: "id"
        }
    },
    productId: {
        type: database.db.Sequelize.INTEGER,
        references: {
            model: Product,
            key: "id"
        }
    },
    quantity: {
        type: database.db.Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = OrderProduct;