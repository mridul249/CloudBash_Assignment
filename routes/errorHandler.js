const express = require("express");
const logger = require("../config/logger");

const router = express.Router();

// 404 Handler
router.use((req, res) => {
  req.flash("error_msg", "Page Not Found");
  res.redirect("/");
});

// Global Error Handler
router.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`);
  req.flash("error_msg", "Internal Server Error");
  res.redirect("/");
});

module.exports = router;
