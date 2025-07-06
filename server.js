const express = require("express");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const app = express();
const cors = require("cors");

const packageJson = require('./package.json');

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

async function loadSecrets() {
    const secretManagerClient = new SecretManagerServiceClient();
    const secretNames = [
        'JWT_SECRET',
        'DATABASE_URL',
        'MERCADO_PAGO_ACCESS_TOKEN',
        'BACKEND_URL',
        'G_CLIENT_ID',
        'G_CLIENT_SECRET',
        'G_REFRESH_TOKEN',
        'G_SENDER_EMAIL',
        'HOSTINGER_EMAIL_PASSWORD'
    ];
    const projectId = 'stocksystem-464322';

    for (const name of secretNames) {
        const secretPath = `projects/${projectId}/secrets/${name}/versions/latest`;
        try {
            const [version] = await secretManagerClient.accessSecretVersion({ name: secretPath });
            const secretValue = version.payload.data.toString('utf8');
            process.env[name] = secretValue;
        } catch (error) {
            console.error(`ERRO FATAL ao carregar o segredo '${name}':`, error);
            process.exit(1);
        }
    }
}

async function startServer() {
    console.log(`Iniciando aplicação em modo: ${process.env.NODE_ENV || 'development'}`);

    if (process.env.NODE_ENV === 'production') {
        await loadSecrets();
    }

    const database = require("./src/config/database");
    const { swaggerUi, swaggerSpec } = require("./src/config/swagger");
    require('./src/jobs/expiredOrders');

    const authRoutes = require("./src/routes/authRoutes");
    const userRoutes = require("./src/routes/userRoutes");
    const orderRoutes = require("./src/routes/orderRoutes");
    const categoryRoutes = require("./src/routes/categoryRoutes");
    const productRoutes = require("./src/routes/productRoutes");
    const paymentRoutes = require("./src/routes/paymentRoutes");
    const supportRoutes = require("./src/routes/supportRoutes");

    const TokenController = require("./src/middlewares/auth.token");
    
    app.get("/", async (req, res) => {
        try {
            await database.db.authenticate();

            res.status(200).json({
                message: "STK API",
                version: packageJson.version,
                status: {
                    api: "online",
                    database: "online"
                }
            });

        } catch (error) {
            console.error("Health check falhou: Impossível conectar ao banco de dados.", error);

            res.status(503).json({
                message: "STK API",
                version: packageJson.version,
                status: {
                    api: "online",
                    database: "offline"
                }
            });
        }
    });

    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.use("/api/v1", authRoutes);

    app.get("/api/v1/auth/validate", TokenController.token, (req, res) => {
        res.status(200).json({ message: "Token is valid." });
    });

    app.use("/api/v1", supportRoutes);
    
    app.use("/api/v1", paymentRoutes);

    app.use(TokenController.token);
    app.use("/api/v1", userRoutes);
    app.use("/api/v1", orderRoutes);
    app.use("/api/v1", categoryRoutes);
    app.use("/api/v1", productRoutes);

    app.use((err, req, res, next) => {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: "Erro interno do servidor" });
    });

    try {
        await database.db.sync({ force: false });
        console.log("\n✅ Conexão com o banco de dados bem-sucedida.");

        app.listen(Number(port), () => {
            console.log(`\n🚀 Servidor rodando na porta ${port}`);
        });

    } catch (error) {
        console.error("\n❌ Erro ao conectar ou sincronizar o banco de dados:", error);
        process.exit(1);
    }
}

startServer();