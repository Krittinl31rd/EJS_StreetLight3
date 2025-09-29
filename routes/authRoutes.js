const express = require("express");
const {
  Login,
  LoginThird,
  Logout,
  Register,
  LoginPage,
  Page401,
  Page403,
  Page403Site,
} = require("../controllers/authController");
const router = express.Router();

router.post("/api/login", Login);
router.post("/api/loginv2", LoginThird);
router.get("/api/logout", Logout);
router.post("/api/register", Register);

router.get("/", LoginPage);
router.get("/login", LoginPage);
router.get("/401", Page401);
router.get("/403", Page403);
router.get("/403_site", Page403Site);

module.exports = router;
