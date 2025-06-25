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
    paymentStatus: {
        type: database.db.Sequelize.STRING,
        defaultValue: 'pending', // 'pending', 'approved', 'cancelled', 'failed'
        allowNull: false,
    },
    paymentId: {
        type: database.db.Sequelize.STRING, // Armazena o ID do pagamento do Mercado Pago
        allowNull: true,
    }
});

module.exports = Order;