const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const i18n = require("i18n");
const sequelize = require("../config/sequelize");

exports.LoginPage = async (req, res) => {
  res.render("login2", {
    layout: false,
    title: "Login page",
    messages: req.flash(),
  });
};

exports.Page403Site = async (req, res) => {
  res.render("403_site", {
    layout: false,
    title: "403",
    messages: req.flash(),
  });
};

exports.Page403 = async (req, res) => {
  res.render("403", {
    layout: false,
    title: "403",
    messages: req.flash(),
  });
};

exports.Page401 = async (req, res) => {
  res.render("401", {
    layout: false,
    title: "401",
    messages: req.flash(),
  });
};

exports.Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check email
    const queryMember = `
        SELECT 
            lm.*, 
            lmsm.site_id, 
            lp.site_role,
            ls.name AS site_name,
            ls.label AS site_label
        FROM Lamp_Members lm
        LEFT JOIN Lamp_Member_Site_Mapping lmsm ON lm.id = lmsm.member_id
        LEFT JOIN Lamp_Permissions lp ON lp.member_id = lm.id AND lp.site_id = lmsm.site_id
        LEFT JOIN Lamp_Sites ls ON ls.id = lmsm.site_id
        WHERE lm.email = :email`;
    const member = await sequelize.query(queryMember, {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT,
    });
    if (member.length <= 0) {
      req.flash("error", i18n.__("passwordInvalid"));
      return res.redirect("/login");
    }
    // // check password
    const isMatch = await bcrypt.compare(password, member[0].password);
    if (!isMatch) {
      req.flash("error", i18n.__("passwordInvalid"));
      return res.redirect("/login");
    }

    // create payload

    const sites = member
      .map((m) => ({
        site_id: m.site_id,
        site_name: m.site_name,
        site_label: m.site_label,
        site_role: m.site_role,
      }))
      .filter((site) => site.site_id !== null);

    const payload = {
      id: member[0].id,
      username: member[0].username,
      member_name: member[0].member_name,
      email: member[0].email,
      img: member[0].img,
      role: member[0].role,
      sites,
    };

    // generate token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Server Error" });
      }
      res.cookie("token", token, { httpOnly: true });
      req.flash("success", i18n.__("loginSuccess"));

      if (payload.role == "Owner") {
        res.redirect("/dashboard");
      } else if (payload.role == "Customer") {
        res.redirect("/customer/sites");
      } else if (payload.role == "Technician") {
        res.redirect("/technician/sites");
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internet Server Error");
  }
};

exports.Logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};

exports.Register = async (req, res) => {
  const { id, username, password, member_name, email, role } = req.body;
  const userRole = role || "Customer";
  try {
    // find already member
    const querySelect = `
            SELECT id, username, email 
            FROM Lamp_Members 
            WHERE id = :id OR username = :username OR email = :email`;

    const isMember = await sequelize.query(querySelect, {
      replacements: { id, username, email },
      type: sequelize.QueryTypes.SELECT,
    });
    if (isMember.length > 0) {
      let exists = [];
      isMember.forEach((member) => {
        if (member.id == id) exists.push("ID");
        if (member.username == username) exists.push("Username");
        if (member.email == email) exists.push("Email");
      });
      return res
        .status(400)
        .json({ message: `Member is already exists: ${exists.join(", ")}` });
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // created member
    const queryCreate = `
        INSERT INTO Lamp_Members 
        (id, username, password, member_name, email, role) 
        VALUES (:id, :username, :password, :member_name, :email, :role)`;
    await sequelize.query(queryCreate, {
      replacements: {
        id,
        username,
        password: hashPassword,
        member_name,
        email,
        role: userRole,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(200).json({
      message: "Register success!!!!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internet Server Error");
  }
};

exports.LoginThird = async (req, res) => {
  const { email, password } = req.body;

  try {
    const queryMember = `
      SELECT 
        lm.*, 
        lmsm.site_id, 
        lp.site_role,
        ls.name AS site_name,
        ls.label AS site_label
      FROM Lamp_Members lm
      LEFT JOIN Lamp_Member_Site_Mapping lmsm ON lm.id = lmsm.member_id
      LEFT JOIN Lamp_Permissions lp ON lp.member_id = lm.id AND lp.site_id = lmsm.site_id
      LEFT JOIN Lamp_Sites ls ON ls.id = lmsm.site_id
      WHERE lm.email = :email
    `;

    const member = await sequelize.query(queryMember, {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT,
    });

    if (member.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, member[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const sites = member
      .map((m) => ({
        site_id: m.site_id,
        site_name: m.site_name,
        site_label: m.site_label,
        site_role: m.site_role,
      }))
      .filter((site) => site.site_id !== null);

    const payload = {
      id: member[0].id,
      username: member[0].username,
      member_name: member[0].member_name,
      email: member[0].email,
      img: member[0].img,
      role: member[0].role,
      sites,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
