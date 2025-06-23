// routes/user.routes.js
const authJwt = require("../middlewares/authJwt.js"); // authJwt is the middleware function
const controller = require("../controllers/user.controller.js");
const express = require("express");
const router = express.Router();

router.put(
  "/update", // This is line 6
  [
    authJwt, // This should be the authJwt function itself
    // controller.validateUpdateUser, // This was commented out
  ],
  controller.updateUser 
);

router.get(
  "/activity-calendar",
  [
    authJwt, // This should be the authJwt function itself
  ],
  controller.getActivityCalendar
);

module.exports = router;