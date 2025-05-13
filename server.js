const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models");
const authRoutes = require("./routes/auth.routes.js");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

db.sequelize.sync().then(() => {
  console.log("Banco de dados sincronizado!");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
