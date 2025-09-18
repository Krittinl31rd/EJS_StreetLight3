const express = require("express");
const {
  LampLog,
  InsertLog,
  InsertLogFromGateway,
  InsertUsageFromGateway,
} = require("../controllers/gatewayController");

const router = express.Router();

router.post("/api/log", LampLog);
router.get("/api/log2", InsertLog);

router.post("/api/add-log", InsertLogFromGateway);
router.post("/api/add-usage-log", InsertUsageFromGateway);

module.exports = router;
