const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

// Importa o Swagger
const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

// Importa o banco de dados
const database = require("./src/config/database");

// Configura o banco de dados
const port = process.env.API_PORT || 3000;

// Importa as rotas
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const productRoutes = require("./src/routes/productRoutes");

// Rota da documentação
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas de autenticação
app.use("/api/v1", authRoutes);

// Rotas principais
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", productRoutes);

// Inicializa o banco de dados e força a sincronização
database.db.sync({ force: true })
.then(() => {
    app.listen(Number(port), () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    })
})
.catch((error) => {
    console.error("Error ao conectar o banco de dados", error);
});