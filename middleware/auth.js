const jwt = require("jsonwebtoken");
const jwtSecret = process.env.SECRET;
const { ACCESS_ROLES, SITE_ROLES } = require("../helpers/routeAccess");

exports.checkRole = (reqRoles) => {
  return (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    // console.log("Token:", token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
      //   return res.redirect("/login");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.member = decoded;

      const allowedRoles = Array.isArray(reqRoles) ? reqRoles : [reqRoles];

      if (!allowedRoles.includes(decoded.role)) {
        // return res.redirect("/403");
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient role" });
      }
      next();
    } catch (err) {
      console.log(err);
      //   return res.redirect("/401");
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

exports.checkSiteRole = (reqSiteRoles) => {
  return (req, res, next) => {
    const member = req.member;
    const site_label = req.params.site_label;
    const site_id = req.params.site_id;

    if (!member) {
      // return res.redirect('/401')
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (member.role === ACCESS_ROLES.OWNER) {
      return next();
    }

    const allowedSiteRoles = Array.isArray(reqSiteRoles)
      ? reqSiteRoles
      : [reqSiteRoles];
    const site = member.sites.find(
      (s) => s.site_label == site_label || s.site_id == parseInt(site_id)
    );

    if (!site) {
      // return res.redirect('/403_site')
      return res
        .status(403)
        .json({ message: "Forbidden: No access to this site" });
    }

    if (!allowedSiteRoles.includes(site.site_role)) {
      // return res.redirect('/403')
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient site role" });
    }

    req.site = site;
    next();
  };
};

// exports.checkTest=(reqSiteRoles) => {
//     return (req, res, next) => {
//         const member=req.member;
//         const site_label=req.params.site_label

//         if (!member) {
//             return res.redirect('/401')
//             // return res.status(401).json({ message: 'Unauthorized' });
//         };

//         if (member.role===ACCESS_ROLES.OWNER) {
//             return next();
//         };

//         const allowedSiteRoles=Array.isArray(reqSiteRoles)? reqSiteRoles:[reqSiteRoles];
//         const site=member.sites.find(s => s.site_label==site_label);

//         if (!site) {
//             return res.redirect('/403')
//             // return res.status(403).json({ message: 'Forbidden: No access to this site' });
//         };

//         if (!allowedSiteRoles.includes(site.site_role)) {
//             return res.redirect('/403')
//             // return res.status(403).json({ message: 'Forbidden: Insufficient site role' });
//         }

//         req.site=site;
//         next();
//     }
// }

// const payload={
//     id: 2150,
//     username: 'test01',
//     member_name: 'test 01',
//     email: 'test01@test01.com',
//     img: null,
//     role: 'Customer',
//     sites: [
//         { site_id: 3, site_role: 'Admin' },
//         { site_id: 10, site_role: 'Admin' },
//         { site_id: 2, site_role: 'Member' }
//     ],
//     iat: 1739868744,
//     exp: 1739955144
// }
