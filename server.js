// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./models"); // Assuming you have a models directory for Sequelize
const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js"); // This line is key

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// db.sequelize.sync().then(() => { // Sync database if you're using Sequelize
//   console.log("Banco de dados sincronizado!");
// });

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // This correctly routes /api/user/* to user.routes.js

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

