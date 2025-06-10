const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

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
const TokenController = require("./src/middlewares/auth.token");

app.use(cors());
app.use(express.json());

// Rota da documentação
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas de autenticação
app.use("/api/v1", authRoutes);

// Rota default
app.get("/", (req, res) => {
    res.send("Connected...")
})

// Rotas principais
app.use(TokenController.token);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", productRoutes);

// Tratação de erros
app.use((err, req, res, next) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);
    
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// Inicializa o banco de dados e força a sincronização
database.db.sync({ force: false })
.then(() => {
    app.listen(Number(port), () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    })
})
.catch((error) => {
    console.error("Error ao conectar o banco de dados: ", error);
});