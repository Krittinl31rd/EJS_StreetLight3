const express = require("express");
const {
  checkUserAccess,
  checkRole,
  checkSiteRole,
  checkTest,
} = require("../middleware/auth");
const { ACCESS_ROLES, SITE_ROLES } = require("../helpers/routeAccess");
const { switchLayout } = require("../helpers/functHelper");
const {
  AllSiteTechnicianPage,
  TechnicianHome,
  TechnicianDevices,
  AddDevices,
  TechnicianMaintenance,
  AddMaintenance,
  TechnicianEditDevices,
  EditDevice,
} = require("../controllers/technicianController");
const router = express.Router();

router.get(
  "/technician/sites",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  AllSiteTechnicianPage
);
router.get(
  "/technician/home",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  TechnicianHome
);
// router.get('/technician/:site_label', checkRole(ACCESS_ROLES.TECHNICIAN), checkSiteRole([SITE_ROLES.ADMIN]), TechnicianHome)
router.get(
  "/technician/:site_label/maintenance",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  TechnicianMaintenance
);
router.get(
  "/technician/:site_label/devices",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  TechnicianDevices
);
router.get(
  "/technician/:site_label/edit-devices",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  TechnicianEditDevices
);

router.post(
  "/api/:site_label/add-maintenance",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  AddMaintenance
);
router.post(
  "/api/:site_label/add-devices",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  AddDevices
);
router.post(
  "/api/:site_label/edit-devices",
  checkRole(ACCESS_ROLES.TECHNICIAN),
  checkSiteRole([SITE_ROLES.ADMIN]),
  EditDevice
);

module.exports = router;
