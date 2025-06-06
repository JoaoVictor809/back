const { signup, signin } = require("../controllers/auth.controller.js");
const express = require("express");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

module.exports = router;
