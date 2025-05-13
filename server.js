const express = require('express');
const app = express();
require('dotenv').config();

const database = require("./src/config/database");
const port = process.env.API_PORT || 3000;

const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const productRoutes = require("./src/routes/productRoutes");

app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", productRoutes);

database.db.sync({ force: false })
.then(() => {
    app.listen(Number(port), () => {
        console.log(`🚀 Server is running on http://localhost:${port}`)
    })
})
.catch((error) => {
    console.error("❌ Error connecting to the database", error);
});