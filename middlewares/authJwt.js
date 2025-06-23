// middlewares/authJwt.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => { // Directly exports the function
  console.log("AuthJWT Middleware: Received headers:", req.headers);
  const token = req.headers["x-access-token"];
  console.log("AuthJWT Middleware: Token from x-access-token header:", token);

  if (!token) {
    return res.status(403).send({ message: "Token não fornecido!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Token inválido!" });
    }
    req.userId = decoded.id;
    next();
  });
};