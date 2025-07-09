const database = require("../config/database");
const User = require("./User");

/**
 * @model Order
 * @summary Define o modelo 'Order' para a tabela de pedidos.
 * @description Representa um pedido feito por um usuário. Armazena dados essenciais
 * como o status do pagamento, informações para o pagamento via PIX, e a referência
 * ao usuário. O 'publicId' (UUID) é usado para expor o pedido de forma segura em URLs,
 * evitando a exposição do 'id' sequencial.
*/
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
    paymentQrCode: {
        type: database.db.Sequelize.TEXT,
        allowNull: true,
    },
    paymentQrCodeBase64: {
        type: database.db.Sequelize.TEXT,
        allowNull: true,
    },
    paymentExpiresAt: {
        type: database.db.Sequelize.DATE,
        allowNull: true,
    },
    paymentStatus: {
        type: database.db.Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false,
    },
    confirmationEmailSent: {
        type: database.db.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    paymentId: {
        type: database.db.Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = Order;