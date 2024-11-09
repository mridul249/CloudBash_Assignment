// errorHandler.js

const logger = require("../config/logger");

// 404 Not Found Handler
function notFoundHandler(req, res, next) {
  logger.warn(`404 Not Found: ${req.originalUrl}`);
  res.status(404).render("404", {
    error: "The page you are looking for does not exist.",
  });
}

// General Error Handler
function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(500).render("500", {
    error: "An internal server error occurred.",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
