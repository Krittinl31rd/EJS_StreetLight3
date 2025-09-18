const express = require("express");
const router = express.Router();
const {
  checkUserAccess,
  checkRole,
  checkSiteRole,
} = require("../middleware/auth");
const {
  CreateMember_AddToSite,
  UpdateMember,
  DeleteMember,
  CreateSite,
  UpdateSite,
  DeleteSite,
  MemberPage,
  DashboardPage,
  SitePage,
  AddMemberToSite,
} = require("../controllers/ownerController");
const { ACCESS_ROLES, SITE_ROLES } = require("../helpers/routeAccess");

router.post(
  "/api/create-member",
  checkRole(ACCESS_ROLES.OWNER),
  CreateMember_AddToSite
);
router.post(
  "/api/add-member/:site_id",
  checkRole(ACCESS_ROLES.OWNER),
  AddMemberToSite
);
router.put(
  "/api/update-member/:site_id/:member_id",
  checkRole([ACCESS_ROLES.OWNER, ACCESS_ROLES.CUSTOMER]),
  checkSiteRole([SITE_ROLES.ADMIN]),
  UpdateMember
);
router.delete(
  "/api/delete-member/:site_id/:member_id",
  checkRole(ACCESS_ROLES.OWNER),
  DeleteMember
);

router.post("/api/create-site", checkRole(ACCESS_ROLES.OWNER), CreateSite);
router.put("/api/update-site/:id", checkRole(ACCESS_ROLES.OWNER), UpdateSite);
router.delete(
  "/api/delete-site/:id",
  checkRole(ACCESS_ROLES.OWNER),
  DeleteSite
);

router.get("/dashboard", checkRole(ACCESS_ROLES.OWNER), DashboardPage);
router.get("/members", checkRole(ACCESS_ROLES.OWNER), MemberPage);
router.get("/sites", checkRole(ACCESS_ROLES.OWNER), SitePage);

module.exports = router;
