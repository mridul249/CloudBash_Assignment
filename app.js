// app.js

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const logger = require("./config/logger");
const securityMiddleware = require("./middleware/security");
const rateLimiter = require("./middleware/rateLimiter");
const indexRoutes = require("./routes/index");
const session = require("express-session");
const flash = require("connect-flash");
const { notFoundHandler, errorHandler } = require("./routes/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Setting up session middleware for flash messages
app.use(
  session({
    secret: "yourSecretKey", 
    resave: false,
    saveUninitialized: true,
  })
);

// Setting up flash middleware
app.use(flash());

// Middleware to make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error")[0] || null;
  res.locals.notice = req.flash("notice")[0] || null;
  next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

securityMiddleware(app);
rateLimiter(app);

// Logging incoming requests
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Use Routes
app.use("/", indexRoutes);

// 404 Not Found Handler (after all routes)
app.use(notFoundHandler);

// General Error Handler (after all middleware)
app.use(errorHandler);

app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
