// middlewares/authJwt.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config(); // Ensure JWT_SECRET is loaded from .env

module.exports = (req, res, next) => {
  console.log("AuthJWT Middleware: Received headers:", req.headers); // For debugging
  
  let token;
  const authHeader = req.headers["authorization"];
  const xAccessToken = req.headers["x-access-token"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Prioritize Authorization header with Bearer token
    token = authHeader.substring(7, authHeader.length); // Remove "Bearer " prefix
    console.log("AuthJWT Middleware: Token from Authorization header (Bearer stripped):", token);
  } else if (xAccessToken) {
    // Fallback to x-access-token
    token = xAccessToken;
    console.log("AuthJWT Middleware: Token from x-access-token header:", token);
  } else {
    // Log se nenhum dos cabeçalhos esperados for encontrado ou se o formato Bearer estiver incorreto
    console.log("AuthJWT Middleware: No token found in Authorization (Bearer) or x-access-token headers, or Authorization header is not in Bearer format.");
  }

  if (!token) {
    return res.status(403).send({ message: "Token não fornecido!" });
  }

  // Verificar se JWT_SECRET está carregado antes de usar
  if (!process.env.JWT_SECRET) {
    console.error("AuthJWT Middleware: JWT_SECRET is not defined in .env file.");
    // Não envie detalhes do erro de configuração para o cliente em produção
    return res.status(500).send({ message: "Erro de configuração interna do servidor." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("AuthJWT Middleware: JWT verification error:", err.message); // For debugging
      // Differentiate between expired token and other invalid token errors for better client handling
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: "Token expirado!", code: "TOKEN_EXPIRED" });
      }
      // Para outros erros de verificação (malformado, assinatura inválida, etc.)
      return res.status(401).send({ message: "Token inválido ou malformado!", code: "TOKEN_INVALID" });
    }
    // If token is valid, attach decoded user ID to request object
    req.userId = decoded.id; 
    console.log("AuthJWT Middleware: Token verified. User ID:", req.userId); // For debugging
    next(); // Proceed to the next middleware or route handler
  });
};