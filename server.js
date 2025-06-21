const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js"); // New line

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

db.sequelize.sync().then(() => {
  console.log("Banco de dados sincronizado!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // New line for user routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
