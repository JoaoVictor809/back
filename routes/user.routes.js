const { authJwt } = require("../middlewares/authJwt.js");
const controller = require("../controllers/user.controller.js");
const express = require("express");
const router = express.Router();

router.put(
  "/update",
  [
    authJwt.verifyToken, // First, verify the token to get req.userId
    // controller.validateUpdateUser, // Then, validate the input. We'll apply validation inside the controller for now.
                                   // If express-validator is to be used as middleware, it needs to handle the errors or pass them.
                                   // For simplicity in this iteration, the controller handles validation directly.
  ],
  controller.updateUser // Call the actual controller function
);

module.exports = router;
