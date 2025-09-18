require("dotenv").config();
const fs = require("fs");
const http = require("http");
const https = require("https");
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const { readdirSync } = require("fs");
const cors = require("cors");
const i18n = require("i18n");
const path = require("path");
const sequelize = require("./config/sequelize");
const { isActiveRoute } = require("./helpers/routeHelpers");

const app = express();

// i18n setup
i18n.configure({
  locales: ["en", "th"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "th",
  queryParameter: "lang",
  cookie: "lang",
});

// Middleware
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "node_modules")));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(i18n.init);
app.use((req, res, next) => {
  const lang = req.query.lang || req.cookies.lang || i18n.getLocale();
  res.cookie("lang", lang);
  i18n.setLocale(lang);
  res.locals.__ = i18n.__;
  res.locals.i18n = i18n;
  next();
});

// EJS setup
app.use(expressLayout);
app.set("layout", "./layouts/owner");
app.set("views", "./views");
app.set("view engine", "ejs");
app.locals.isActiveRoute = isActiveRoute;

// Load routes
readdirSync("./routes/").map((c) => {
  app.use(require("./routes/" + c));
});

// HTTP and HTTPS
const HTTP_PORT = process.env.HTTP_PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5444;

// HTTPS options (replace with your certs)
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
};

// Create HTTP server
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});

// Create HTTPS server
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on port ${HTTPS_PORT}`);
});
