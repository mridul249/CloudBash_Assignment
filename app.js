const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const logger = require("./config/logger");
const securityMiddleware = require("./middleware/security");
const rateLimiter = require("./middleware/rateLimiter");
const indexRoutes = require("./routes/index");
const errorHandler = require("./routes/errorHandler");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();
const PORT = process.env.PORT || 3000;

// Setting up session middleware for flash messages
app.use(
  session({
    secret: "yourSecretKey", //just a temporary key
    resave: false,
    saveUninitialized: true,
  })
);

// Setting up flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

securityMiddleware(app);
rateLimiter(app);

app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.use("/", indexRoutes);
app.use(errorHandler);

app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
