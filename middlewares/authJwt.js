// middlewares/authJwt.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Ensure JWT_SECRET is loaded from .env

module.exports = (req, res, next) => {
  console.log("AuthJWT Middleware: Received headers:", req.headers); // For debugging
  const token = req.headers["x-access-token"];
  console.log("AuthJWT Middleware: Token from x-access-token header:", token); // For debugging

  if (!token) {
    return res.status(403).send({ message: "Token não fornecido!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("AuthJWT Middleware: JWT verification error:", err.message); // For debugging
      return res.status(401).send({ message: "Token inválido!" });
    }
    // If token is valid, attach decoded user ID to request object
    req.userId = decoded.id; 
    console.log("AuthJWT Middleware: Token verified. User ID:", req.userId); // For debugging
    next(); // Proceed to the next middleware or route handler
  });
};