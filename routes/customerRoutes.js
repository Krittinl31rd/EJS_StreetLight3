const express = require("express");
const {
  checkUserAccess,
  checkRole,
  checkSiteRole,
  checkTest,
} = require("../middleware/auth");
const {
  AllSiteCustomerPage,
  DashboardSitePage,
  SiteMemberPage,
  ManageSitePage,
  ManageMemberRolePage,
  ManageDevices,
  ManageMap,
  AddSchduleDevice,
  UsageByMember,
  ManageLog,
  GetLogFromGateway,
  GetLogFromGateway2,
  ReportDevices,
  ReportMaintenance,
  getLog,
  getMembers,
  sitesListWithMemberId,
  siteListWithId,
  DeviceListInSite,
  getMaintenanceLog,
  getOverviews,
} = require("../controllers/customerController");
const {
  CreateMember_AddToSite,
  DeleteMember,
} = require("../controllers/ownerController");
const { ACCESS_ROLES, SITE_ROLES } = require("../helpers/routeAccess");
const router = express.Router();

router.get(
  "/customer/sites",
  checkRole(ACCESS_ROLES.CUSTOMER),
  AllSiteCustomerPage
);
// router.get('/customer/site/:site_id', checkRole(ACCESS_ROLES.CUSTOMER), checkSiteRole([SITE_ROLES.ADMIN, SITE_ROLES.MEMBER]), DashboardSitePage);
router.get(
  "/customer/:site_label",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN, SITE_ROLES.MEMBER]),
  DashboardSitePage
);
// router.get('/customer/manage/site/:site_id', checkRole(ACCESS_ROLES.CUSTOMER), checkSiteRole([SITE_ROLES.ADMIN]), ManageSitePage);
router.get(
  "/customer/:site_label/manage",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ManageSitePage
);
// router.get('/customer/manage/member/:site_id', checkRole(ACCESS_ROLES.CUSTOMER), checkSiteRole([SITE_ROLES.ADMIN]), ManageMemberRolePage);
router.get(
  "/customer/:site_label/manage/member",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ManageMemberRolePage
);
// router.get('/devices/:site_id', checkRole(ACCESS_ROLES.CUSTOMER), checkSiteRole([SITE_ROLES.ADMIN]), ManageDevices);
router.get(
  "/customer/:site_label/devices",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ManageDevices
);
// router.get('/report_devices/:site_id', checkRole(ACCESS_ROLES.CUSTOMER), checkSiteRole([SITE_ROLES.ADMIN]), ReportDevices);
router.get(
  "/customer/:site_label/report_devices",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ReportDevices
);
router.get(
  "/customer/:site_label/report_maintenance",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ReportMaintenance
);
router.get(
  "/customer/:site_label/logs",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ManageLog
);
router.get(
  "/customer/:site_label/map",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  ManageMap
);

// ----------------------------------------------------------------------------------------------------------------------------------

router.get(
  "/api/sites",
  checkRole(ACCESS_ROLES.CUSTOMER),
  sitesListWithMemberId
);
router.get(
  "/api/get-site/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  siteListWithId
);
router.get(
  "/api/get-member/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  getMembers
);
router.post(
  "/api/create-member/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  CreateMember_AddToSite
);
router.delete(
  "/api/delete-member/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  DeleteMember
);
router.post(
  "/api/save-schedule/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  AddSchduleDevice
);
router.post(
  "/api/save-usage/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  UsageByMember
);
router.get(
  "/api/get-chart/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  GetLogFromGateway
);
router.get(
  "/api/get-chart2/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  GetLogFromGateway2
);
router.get(
  "/api/get-maintenance/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  getMaintenanceLog
);
router.get(
  "/api/get-log/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  getLog
);
router.get(
  "/api/get-devicelist/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  DeviceListInSite
);
router.get(
  "/api/get-overviews/:site_id",
  checkRole(ACCESS_ROLES.CUSTOMER),
  checkSiteRole([SITE_ROLES.ADMIN]),
  getOverviews
);

module.exports = router;
