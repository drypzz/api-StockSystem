const database = require("../config/database");
const User = require("./User");

const Order = database.db.define("order", {
    id: {
        type: database.db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    publicId: {
        type: database.db.Sequelize.UUID,
        defaultValue: database.db.Sequelize.UUIDV4,
        allowNull: false,
        unique: true
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
        type: database.db.Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = Order;