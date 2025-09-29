const i18n = require("i18n");
const { DateTime } = require("luxon");
const sequelize = require("../config/sequelize");
const { allRole, allEnabled, allRoleSite } = require("../helpers/routeAccess");
const { GetFormattedDate } = require("../helpers/dateHelper");
const customerLayout = "../views/layouts/customer";

exports.AllSiteCustomerPage = async (req, res) => {
  const site_role = null;
  res.render("customer/all_sites", {
    layout: customerLayout,
    tab: "customer_sites",
    title: "Customer | LeKise The Lamp",
    currentRoute: "/customer/sites",
    member: req.member,
    messages: req.flash(),
    site_role,
    sites: await siteListWithMemberID(req.member),
  });
};

exports.DashboardSitePage = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const [siteName] = await getSiteName(site_id);
  res.render("customer/site", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/dashboard`,
    member: req.member,
    messages: req.flash(),
    site_role,
    site_label,
    siteName,
  });
};

exports.ManageSitePage = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/site_manager", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/manage_site`,
    member: req.member,
    messages: req.flash(),
    site_role,
    site_label,
    sites_list: await sitesList(site_id),
  });
};

exports.ManageMemberRolePage = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const memberList = await membersList(site_id, req.member.id, site_role);
  // console.log(memberList);
  res.render("customer/manage_member", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/manage_member_role`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    membersList: memberList[0]?.members,
    allRoleSite,
    allRole,
  });
};

exports.ManageDevices = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/devices", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/devices`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    groupListOnSite: await groupListOnSite(site_id),
    contractListOnSite: await contractListOnSite(site_id),
    devicesList: await siteWithDevices(site_id),
  });
};

exports.ReportDevices = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/device_report", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/report_devices`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    allDevice: await deviceList(site_id),
  });
};

exports.ReportMaintenance = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/maintenance_report", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/report_maintenance`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    maintenanceList: await maintenanceListComplete(site_id),
  });
};

exports.ManageLog = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/log", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/logs`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    allGateway: await gatewayListOnSite(site_id),
    allDevice: await deviceList(site_id),
    allMember: await allMembers(site_id, req.member.id),
    // allLog: await getAllLog(site_id)
  });
};

exports.ManageMap = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("customer/map", {
    layout: customerLayout,
    title: `${site_role} | ${site_name}`,
    currentRoute: `/map`,
    member: req.member,
    messages: req.flash(),
    site_id,
    site_role,
    site_label,
    devicesList: await siteWithDevices(site_id),
  });
};

exports.UsageByMember = async (req, res) => {
  const { type, device_usage } = req.body;
  try {
    if (type == "usage") {
      if (device_usage.length > 0) {
        const promises = device_usage.map(async (device) => {
          const queryInsert = `
                    INSERT INTO Lamp_Log (type, detail, control_by, site_id, created_at)
                    VALUES (:type, :detail, :control_by, :site_id, :created_at)
                `;
          await sequelize.query(queryInsert, {
            replacements: {
              type: type,
              detail: JSON.stringify([device]),
              control_by: req.member.id,
              site_id: req.params.site_id,
              created_at: GetFormattedDate(),
            },
            type: sequelize.QueryTypes.INSERT,
          });
        });
        await Promise.all(promises);
        // console.log("usage is created");
        res.status(200).json({ message: "Usage is created" });
      }
    } else if (type == "usage_group") {
      if (device_usage.length > 0) {
        const queryInsert = `
                    INSERT INTO Lamp_Log (type, detail, control_by, site_id, created_at)
                    VALUES (:type, :detail, :control_by, :site_id, :created_at)
                `;
        await Promise.all(
          await sequelize.query(queryInsert, {
            replacements: {
              type: type,
              detail: JSON.stringify(device_usage),
              control_by: req.member.id,
              site_id: req.params.site_id,
              created_at: GetFormattedDate(),
            },
            type: sequelize.QueryTypes.INSERT,
          })
        );
        // console.log("usage is created");
        res.status(200).json({ message: "Usage is created" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internet Server Error");
  }
};

exports.AddSchduleDevice = async (req, res) => {
  const { dataConfig } = req.body;
  try {
    if (dataConfig.length > 0) {
      const promises = dataConfig.map(async (device) => {
        const querySearch = `
                    SELECT id FROM Lamp_Config 
                    WHERE gateway_id = :gateway_id 
                    AND device_id = :device_id
                    AND type = :type
                    AND site_id = :site_id`;
        const existing = await sequelize.query(querySearch, {
          replacements: {
            gateway_id: device.gateway_id,
            device_id: device.device_id,
            type: device.type,
            site_id: req.params.site_id,
          },
          type: sequelize.QueryTypes.SELECT,
        });

        if (existing.length > 0) {
          // console.log(device);
          const queryUpdate = `
                        UPDATE Lamp_Config 
                        SET detail = :detail, performed_by = :member_id, created_at = :created_at
                        WHERE gateway_id = :gateway_id 
                        AND device_id = :device_id 
                        AND type = :type
                        AND site_id = :site_id`;
          await sequelize.query(queryUpdate, {
            replacements: {
              gateway_id: device.gateway_id,
              device_id: device.device_id,
              type: device.type,
              detail: JSON.stringify(device.detail),
              member_id: req.member.id,
              site_id: req.params.site_id,
              created_at: GetFormattedDate(),
            },
            type: sequelize.QueryTypes.UPDATE,
          });
          // console.log("Updated existing record");
        } else {
          const queryInsert = `
                        INSERT INTO Lamp_Config
                        (gateway_id, device_id, type, detail, performed_by, site_id, created_at)
                        VALUES (:gateway_id, :device_id, :type, :detail, :member_id, :site_id, :created_at)`;
          await sequelize.query(queryInsert, {
            replacements: {
              gateway_id: device.gateway_id,
              device_id: device.device_id,
              type: device.type,
              detail: JSON.stringify(device.detail),
              member_id: req.member.id,
              site_id: req.params.site_id,
              created_at: GetFormattedDate(),
            },
            type: sequelize.QueryTypes.INSERT,
          });
          // console.log("Inserted new record");
        }
      });

      await Promise.all(promises);

      res.status(200).json({
        message: "Processed all devices",
      });
    } else {
      res.status(400).json({
        message: "No data provided",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getLog = async (req, res) => {
  try {
    const {
      member_id,
      gateway_id,
      device_id,
      type,
      search_data,
      date_start,
      date_end,
    } = req.query;

    const replacements = { site_id: req.params.site_id };

    if (date_start) {
      const startDate = new Date(date_start);
      startDate.setUTCHours(0, 0, 0, 0);
      replacements.date_start = startDate.toISOString();
    }

    if (date_end) {
      const endDate = new Date(date_end);
      endDate.setUTCHours(23, 59, 59, 999);
      replacements.date_end = endDate.toISOString();
    }

    // usage log schedule
    let query = "";
    if (type == "usage") {
      query = `
    SELECT
        ll.type AS log_type,
        ll.detail AS log_detail,
        ll.created_at AS created_at,
        lm.id AS member_id,
        lm.member_name AS member_name
    FROM Lamp_Log ll
    LEFT JOIN Lamp_Members lm ON lm.id = ll.control_by
    WHERE site_id = :site_id 
    AND (ll.type = 'usage' OR ll.type = 'usage_group')
    ${
      date_start && date_end
        ? "AND ll.created_at BETWEEN :date_start AND :date_end"
        : ""
    }
    ORDER BY ll.created_at DESC;`;
    } else if (type == "log") {
      query = `
    SELECT
        ll.type AS log_type,
        ll.detail AS log_detail,
        ll.created_at AS created_at
    FROM Lamp_Log ll
    WHERE site_id = :site_id
    AND ll.type = 'log'
    ${
      date_start && date_end
        ? "AND ll.created_at BETWEEN :date_start AND :date_end"
        : ""
    }
    ORDER BY ll.created_at DESC;`;
    } else if (type == "schedule") {
      query = `
    SELECT
        lc.gateway_id AS gateway_id,
        lc.device_id AS device_id,
        lc.type AS config_type,
        lc.detail AS config_detail,
        lc.created_at AS created_at,
        lm.id AS member_id,
        lm.member_name AS member_name  
    FROM Lamp_Config lc
    LEFT JOIN Lamp_Members lm ON lm.id = lc.performed_by
    WHERE site_id = :site_id
    ORDER BY lc.created_at DESC;`;
    }

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // { member_id, gateway_id, device_id, type, search_data, date_start, date_end }
    const searchValue = search_data.trim().toLowerCase();
    let output = [];
    if (type == "usage") {
      // if (searchValue||member_id!=="all"||gateway_id!=="all"||device_id!=="all") {
      output = result.flatMap((row) => {
        const usageDetails = JSON.parse(row.log_detail);
        return usageDetails
          .filter((device) => {
            return (
              (member_id == "all" || row.member_id == member_id) &&
              (gateway_id == "all" || device.gateway_id == gateway_id) &&
              (device_id == "all" || device.device_id == device_id) &&
              (searchValue === "" ||
                String(row.member_id).toLowerCase().includes(searchValue) ||
                String(device.gateway_id).toLowerCase().includes(searchValue) ||
                String(device.device_id).toLowerCase().includes(searchValue))
            );
          })
          .map((device) => ({
            log_type: row.log_type,
            gateway_id: device.gateway_id,
            device_id: device.device_id,
            control_id: device.control_id,
            last_value: device.V,
            member_id: row.member_id,
            member_name: row.member_name,
            created_at: row.created_at,
          }));
      });
      // }
    } else if (type == "log") {
      output = result.flatMap((row) => {
        const logDetails = JSON.parse(row.log_detail);

        return logDetails
          .filter((device) => {
            return (
              (member_id == "all" || row.member_id == member_id) &&
              (gateway_id == "all" || device.gateway_id == gateway_id) &&
              (device_id == "all" || device.device_id == device_id) &&
              (searchValue === "" ||
                String(row.member_id).toLowerCase().includes(searchValue) ||
                String(device.gateway_id).toLowerCase().includes(searchValue) ||
                String(device.device_id).toLowerCase().includes(searchValue))
            );
          })
          .map((device) => ({
            log_type: row.log_type,
            gateway_id: device.gateway_id,
            device_id: device.device_id,
            input: device.input,
            output: device.output,
            battery: device.battery,
            env: device.env,
            created_at: row.created_at,
          }));
      });
    } else if (type == "schedule") {
      output = result
        .filter((row) => {
          return (
            (member_id == "all" || row.member_id == member_id) &&
            (gateway_id == "all" || row.gateway_id == gateway_id) &&
            (device_id == "all" || row.device_id == device_id) &&
            (searchValue === "" ||
              String(row.member_id).toLowerCase().includes(searchValue) ||
              String(row.gateway_id).toLowerCase().includes(searchValue) ||
              String(row.device_id).toLowerCase().includes(searchValue))
          );
        })
        .map((row) => ({
          log_type: row.config_type,
          gateway_id: row.gateway_id,
          device_id: row.device_id,
          config_detail: JSON.parse(row.config_detail),
          member_id: row.member_id,
          member_name: row.member_name,
          created_at: row.created_at,
        }));
    }

    res.status(200).json({
      message: "Success",
      data: output,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.GetLogFromGateway = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  try {
    const { type, date_start, date_end, device_id, gateway_id } = req.query;
    // console.log(device_id);
    const startDate = date_start ? new Date(date_start) : null;
    const endDate = date_end ? new Date(date_end) : null;

    if (startDate) startDate.setUTCHours(0, 0, 0, 0);
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);

    const query = `        
        SELECT
            ll.type AS log_type,
            ll.detail AS log_detail,
            ll.created_at AS created_at
        FROM Lamp_Log ll
        WHERE site_id = :site_id AND ll.type = 'log'`;
    const result = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });

    const logOutput = result.flatMap((row) => {
      const logDetails = JSON.parse(row.log_detail);
      return logDetails
        .filter((device) => {
          const logDate = new Date(device.timestamp);
          const matchesDate =
            (!startDate || logDate >= startDate) &&
            (!endDate || logDate <= endDate);
          const matchesDevice =
            device_id && gateway_id
              ? device_id == device.device_id && gateway_id == device.gateway_id
              : true;
          return matchesDate && matchesDevice;
        })
        .map((device) => ({
          log_type: row.log_type,
          gateway_id: device.gateway_id,
          device_id: device.device_id,
          input: device.input,
          output: device.output,
          battery: device.battery,
          env: device.env,
          timestamp: device.timestamp,
        }));
    });

    res.status(200).json({
      message: "Success",
      data: logOutput,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.GetLogFromGateway2 = async (req, res) => {
  const { site_id } = req.site;
  try {
    const { date_start, date_end, device_id, gateway_id } = req.query;

    const startDate = date_start ? new Date(date_start) : null;
    const endDate = date_end ? new Date(date_end) : null;

    if (startDate) startDate.setUTCHours(0, 0, 0, 0);
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);

    const query = `
      SELECT
          ll.type AS log_type,
          ll.detail AS log_detail,
          ll.created_at AS created_at
      FROM Lamp_Log ll
      WHERE site_id = :site_id AND ll.type = 'log'
    `;
    const result = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });

    // --- parse logs ---
    let logs = result.flatMap((row) => {
      const logDetails = JSON.parse(row.log_detail);
      return logDetails
        .filter((device) => {
          const logDate = new Date(device.timestamp);
          const matchesDate =
            (!startDate || logDate >= startDate) &&
            (!endDate || logDate <= endDate);
          const matchesDevice =
            device_id && gateway_id
              ? device_id == device.device_id && gateway_id == device.gateway_id
              : true;
          return matchesDate && matchesDevice;
        })
        .map((device) => {
          // UTC → +7
          const utcDate = new Date(device.timestamp);
          // const localDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

          // --- คำนวณค่า ---
          const inputVal =
            device.input && device.input.volt && device.input.current
              ? device.input.volt * device.input.current
              : 0;

          const outputVal =
            device.output && device.output.volt && device.output.current
              ? device.output.volt * device.output.current
              : 0;

          const batteryVal =
            device.battery && device.battery.level ? device.battery.level : 0;

          return {
            log_type: row.log_type,
            gateway_id: device.gateway_id,
            device_id: device.device_id,
            input: inputVal,
            output: outputVal,
            battery: batteryVal,
            env: device.env,
            timestamp: utcDate,
          };
        });
    });

    if (logs.length === 0) {
      return res.status(200).json({ message: "Success", data: [] });
    }

    // --- aggregation level ---
    const rangeDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    let aggregated = [];

    if (rangeDays <= 1) {
      // ---- case: 1 วัน → hourly ----
      const buckets = {};
      logs.forEach((log) => {
        const h = log.timestamp.getHours();
        if (!buckets[h]) buckets[h] = [];
        buckets[h].push(log);
      });
      aggregated = Object.entries(buckets).map(([hour, items]) => ({
        period: `${hour}:00`,
        // count: items.length,
        avgInput: Number(
          (
            items.reduce((a, b) => a + (b.input || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgOutput: Number(
          (
            items.reduce((a, b) => a + (b.output || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgBattery: Number(
          (
            items.reduce((a, b) => a + (b.battery || 0), 0) / items.length
          ).toFixed(2)
        ),
      }));
    } else if (rangeDays <= 31) {
      // ---- case: <= 31 วัน → daily ----
      const buckets = {};
      logs.forEach((log) => {
        const key = log.timestamp.toISOString().slice(0, 10); // YYYY-MM-DD
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(log);
      });
      aggregated = Object.entries(buckets).map(([day, items]) => ({
        period: day,
        // count: items.length,
        avgInput: Number(
          (
            items.reduce((a, b) => a + (b.input || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgOutput: Number(
          (
            items.reduce((a, b) => a + (b.output || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgBattery: Number(
          (
            items.reduce((a, b) => a + (b.battery || 0), 0) / items.length
          ).toFixed(2)
        ),
      }));
    } else {
      // ---- case: > 31 วัน → monthly ----
      const buckets = {};
      logs.forEach((log) => {
        const y = log.timestamp.getFullYear();
        const m = log.timestamp.getMonth() + 1;
        const key = `${y}-${String(m).padStart(2, "0")}`;
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(log);
      });
      aggregated = Object.entries(buckets).map(([month, items]) => ({
        period: month,
        // count: items.length,
        avgInput: Number(
          (
            items.reduce((a, b) => a + (b.input || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgOutput: Number(
          (
            items.reduce((a, b) => a + (b.output || 0), 0) / items.length
          ).toFixed(2)
        ),
        avgBattery: Number(
          (
            items.reduce((a, b) => a + (b.battery || 0), 0) / items.length
          ).toFixed(2)
        ),
      }));
    }

    aggregated.sort((a, b) => new Date(a.period) - new Date(b.period));

    res.status(200).json({
      message: "Success",
      data: aggregated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.SiteMemberPage = async (req, res) => {
  res.json({ message: `welcome member page site ${req.params.site_id}` });
};

const getSiteName = async (site_id) => {
  try {
    const query = `
        SELECT TOP 1 * FROM Lamp_Sites WHERE id = :site_id
        `;
    const result = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.error(err);
  }
};

const sitesList = async (site_id) => {
  try {
    const querySelect = `SELECT * FROM Lamp_Sites WHERE id = :site_id`;
    const result = await sequelize.query(querySelect, {
      replacements: { site_id: site_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const allMembers = async (site_id, member_id) => {
  try {
    const query = `
            SELECT 
                ls.id AS site_id, 
                ls.name AS site_name,
                lm.id AS member_id, 
                lm.member_name AS member_name, 
                lm.email AS member_email,
                lm.enabled AS member_enabled,
                lm.role AS member_role
            FROM Lamp_Sites ls
            LEFT JOIN Lamp_Member_Site_Mapping lmsm ON ls.id = lmsm.site_id
            LEFT JOIN Lamp_Members lm ON lmsm.member_id = lm.id
            LEFT JOIN Lamp_Permissions lp ON lp.member_id = lm.id AND lp.site_id = lmsm.site_id
            WHERE ls.id = :site_id 
            ORDER BY ls.id,lm.member_name
        `;

    const result = await sequelize.query(query, {
      replacements: { site_id, member_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const membersList = async (site_id, member_id, site_role) => {
  try {
    const query = `
            SELECT 
                ls.id AS site_id, 
                ls.name AS site_name,
                lm.id AS member_id, 
                lm.member_name AS member_name, 
                lm.email AS member_email,
                lm.enabled AS member_enabled,
                lm.role AS member_role,
                lp.site_role AS site_role
            FROM Lamp_Sites ls
            LEFT JOIN Lamp_Member_Site_Mapping lmsm ON ls.id = lmsm.site_id
            LEFT JOIN Lamp_Members lm ON lmsm.member_id = lm.id
            LEFT JOIN Lamp_Permissions lp ON lp.member_id = lm.id AND lp.site_id = lmsm.site_id
            WHERE ls.id = :site_id AND lm.id != :member_id
            ORDER BY ls.id, lp.site_role, lm.member_name
        `;

    const result = await sequelize.query(query, {
      replacements: { site_id, member_id, site_role },
      type: sequelize.QueryTypes.SELECT,
    });
    // console.log(result);
    const siteMap = {};

    result.forEach((row) => {
      if (!siteMap[row.site_id]) {
        siteMap[row.site_id] = {
          id: row.site_id,
          name: row.site_name,
          members: [],
        };
      }

      if (row.member_id) {
        let member = siteMap[row.site_id].members.find(
          (m) => m.id === row.member_id
        );

        if (!member) {
          member = {
            id: row.member_id,
            member_name: row.member_name,
            email: row.member_email,
            enabled: row.member_enabled,
            role: row.member_role,
            sites: [],
          };
          siteMap[row.site_id].members.push(member);
        }

        if (!member.sites.some((site) => site.site_id === row.site_id)) {
          member.sites.push({
            site_id: row.site_id,
            site_role: row.site_role,
          });
        }
      }
    });

    // console.log(JSON.stringify(Object.values(siteMap), null, 2));
    return Object.values(siteMap);
  } catch (err) {
    console.error(err);
  }
};

const deviceList = async (site_id) => {
  try {
    const query = `
        SELECT
            lg.id AS gateway_id,
            lg.gateway_name AS gateway_name,
            lc.contract_number AS contract_number,
            d.DeviceID AS device_id,
            d.DeviceName AS device_name,
            lgm.group_id AS group_id,
            lgp.group_name AS group_name
        FROM Lamp_Contracts lc
        JOIN Lamp_Gateways lg ON lc.id=lg.contract_id
        LEFT JOIN Devices d ON d.MemberID = lg.id AND d.DeviceStyleID = 3
        LEFT JOIN Lamp_Group_Mapping lgm ON lgm.gateway_id = lg.id AND lgm.device_id = d.DeviceID
        LEFT JOIN Lamp_Groups lgp ON lgm.group_id = lgp.id
        WHERE lc.site_id = :site_id
        ORDER BY lc.site_id, d.DeviceID;`;

    const result = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const siteListWithMemberID = async (payload) => {
  try {
    const query = `
            SELECT 
                ls.id AS site_id, 
                ls.name AS site_name,
                ls.description AS description,
                ls.label AS label,
                lm.id AS member_id, 
                lm.member_name AS member_name, 
                lm.email AS member_email,
                lm.enabled AS member_enabled,
                lm.role AS member_role,
                lp.site_role AS site_role
            FROM Lamp_Sites ls
            LEFT JOIN Lamp_Member_Site_Mapping lmsm ON ls.id = lmsm.site_id
            LEFT JOIN Lamp_Members lm ON lmsm.member_id = lm.id
            LEFT JOIN Lamp_Permissions lp ON lp.member_id = lm.id AND lp.site_id = lmsm.site_id
            WHERE lm.id = :member_id
            ORDER BY ls.id, lp.site_role, lm.member_name
        `;

    const result = await sequelize.query(query, {
      replacements: { member_id: payload.id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.error(err);
  }
};

const contractListOnSite = async (site_id) => {
  const query = `SELECT * FROM Lamp_Contracts WHERE site_id = :site_id`;
  const result = await sequelize.query(query, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });
  return result;
};

const groupListOnSite = async (site_id) => {
  const query = `SELECT * FROM Lamp_Groups WHERE site_id = :site_id`;
  const result = await sequelize.query(query, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });
  return result;
};

const siteWithDevices = async (site_id) => {
  const query = `
    SELECT
        lc.site_id AS site_id,
        lc.id AS contract_id,
        lc.contract_number AS contract_number,
        lg.id AS gateway_id,
        lg.gateway_name AS gateway_name,
        lg.lat AS gateway_lat,
        lg.long AS gateway_long,
        d.DeviceID AS device_id,
        d.DeviceName AS device_name,
        d.DeviceStyleID AS device_style,
        d.lat AS device_lat,
        d.long AS device_long,
        dc.ControlID AS control_id,
        dc.Label AS label,
        dc.LastValue AS last_value,
        g.id AS group_id,
        g.group_name AS group_name,
        g.description AS group_description,
        lcf.id AS config_id,
        lcf.type AS config_type,
        lcf.detail AS config_detail,
        lcf.status AS config_status
    FROM Lamp_Contracts lc
    JOIN Lamp_Gateways lg ON lc.id = lg.contract_id
    LEFT JOIN Devices d ON d.MemberID = lg.id AND d.DeviceStyleID = 3
    LEFT JOIN DevicetControl dc ON dc.MemberID = lg.id AND dc.DeviceID = d.DeviceID
    LEFT JOIN Lamp_Group_Mapping gm ON gm.site_id = lc.site_id AND gm.gateway_id = lg.id AND gm.device_id = d.DeviceID
    LEFT JOIN Lamp_Groups g ON g.id = gm.group_id
    LEFT JOIN Lamp_Config lcf ON lcf.gateway_id = lg.id AND lcf.device_id = d.DeviceID
    WHERE lc.site_id = :site_id
    ORDER BY lc.site_id, lc.id, d.DeviceID;`;

  const result = await sequelize.query(query, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });

  let output = [];
  let deviceMap = {};

  result.forEach((row) => {
    const gatewayExists = output.some(
      (item) => item.gateway_id === row.gateway_id && !item.device_id
    );

    if (!gatewayExists) {
      output.push({
        site_id: row.site_id,
        contract_id: row.contract_id,
        contract_number: row.contract_number,
        group_id: row.group_id,
        group_name: row.group_name,
        gateway_id: row.gateway_id,
        gateway_name: row.gateway_name,
        gateway_lat: row.gateway_lat,
        gateway_long: row.gateway_long,
        type: "gateway",
      });
    }

    if (row.device_id) {
      const deviceKey = `${row.gateway_id}_${row.device_id}`;

      if (!deviceMap[deviceKey]) {
        deviceMap[deviceKey] = {
          site_id: row.site_id,
          contract_id: row.contract_id,
          contract_number: row.contract_number,
          gateway_id: row.gateway_id,
          gateway_name: row.gateway_name,
          device_id: row.device_id,
          device_name: row.device_name,
          device_style: row.device_style,
          lat: row.device_lat,
          long: row.device_long,
          group_id: row.group_id,
          group_name: row.group_name,
          description: row.group_description,
          controls: [],
          config: [],
        };
        output.push(deviceMap[deviceKey]);
      }

      if (row.control_id !== null) {
        deviceMap[deviceKey].controls.push({
          control_id: row.control_id,
          label: row.label,
          last_value: row.last_value,
        });
      }

      if (
        row.config_id !== null &&
        !deviceMap[deviceKey].config.some((c) => c.config_id === row.config_id)
      ) {
        deviceMap[deviceKey].config.push({
          config_id: row.config_id,
          type: row.config_type,
          detail: row.config_detail,
          status: row.config_status,
        });
      }
    }
  });

  return output;
};

const getAllLog = async (site_id) => {
  const query = `
    SELECT
        ll.type AS log_type,
        ll.detail AS log_detail,
        ll.created_at AS created_at,
        lm.id AS member_id,
        lm.member_name AS member_name
    FROM Lamp_Log ll
    LEFT JOIN Lamp_Members lm ON lm.id = ll.control_by
    WHERE site_id = :site_id AND (ll.type = 'usage' OR ll.type = 'usage_group')
    ORDER BY ll.created_at DESC;
    `;

  const result = await sequelize.query(query, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });

  const query2 = `
    SELECT
        lc.gateway_id AS gateway_id,
        lc.device_id AS device_id,
        lc.type AS config_type,
        lc.detail AS config_detail,
        lc.created_at AS created_at,
        lm.id AS member_id,
        lm.member_name AS member_name  
    FROM Lamp_Config lc
    LEFT JOIN Lamp_Members lm ON lm.id = lc.performed_by
    WHERE site_id = :site_id
    ORDER BY lc.created_at DESC;
    `;

  const result2 = await sequelize.query(query2, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });

  const query3 = `
        SELECT
            ll.type AS log_type,
            ll.detail AS log_detail,
            ll.created_at AS created_at
        FROM Lamp_Log ll
        WHERE site_id = :site_id AND ll.type = 'log'
        ORDER BY ll.created_at DESC;
        `;
  const result3 = await sequelize.query(query3, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });

  const usageOutput = result.flatMap((row) => {
    const usageDetails = JSON.parse(row.log_detail);
    return usageDetails.map((device) => ({
      log_type: row.log_type,
      gateway_id: device.gateway_id,
      device_id: device.device_id,
      control_id: device.control_id,
      last_value: device.V,
      member_id: row.member_id,
      member_name: row.member_name,
      created_at: row.created_at,
    }));
  });

  const configsOutput = result2.map((row) => ({
    log_type: row.config_type,
    gateway_id: row.gateway_id,
    device_id: row.device_id,
    config_detail: JSON.parse(row.config_detail),
    member_id: row.member_id,
    member_name: row.member_name,
    created_at: row.created_at,
  }));

  const logOutput = result3.flatMap((row) => {
    const logDetails = JSON.parse(row.log_detail);
    return logDetails.map((device) => ({
      log_type: row.log_type,
      gateway_id: device.gateway_id,
      device_id: device.device_id,
      input: device.input,
      output: device.output,
      battery: device.battery,
      env: device.env,
      created_at: row.created_at,
    }));
  });

  return [...usageOutput, ...logOutput, ...configsOutput];
};

const gatewayListOnSite = async (site_id) => {
  const query = `
            SELECT 
                lg.id AS gateway_id,
                lg.gateway_name AS gateway_name
            FROM Lamp_Contracts lc
            LEFT JOIN Lamp_Gateways lg ON lc.id = lg.contract_id
            WHERE lc.site_id = :site_id
        `;
  const result = await sequelize.query(query, {
    replacements: { site_id },
    type: sequelize.QueryTypes.SELECT,
  });

  return result;
};

const maintenanceListComplete = async (site_id) => {
  try {
    const query = `
        SELECT
            lm.*, 
            d.DeviceName AS device_name
        FROM Lamp_Maintenance lm
        LEFT JOIN Devices d 
            ON lm.gateway_id = d.MemberID 
            AND lm.device_id = d.DeviceID
        WHERE site_id = :site_id AND status = 'Completed'
        ORDER BY maintenance_date DESC`;
    const data = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return data;
  } catch (err) {
    console.log(err);
  }
};

const summaryOverviews = async (site_id) => {
  try {
    const query = `
      SELECT
          lc.site_id AS site_id,
          lg.id AS gateway_id,
          d.DeviceID AS device_id,
          dc.ControlID AS control_id,
          dc.LastValue AS last_value
      FROM Lamp_Contracts lc
      JOIN Lamp_Gateways lg 
          ON lc.id = lg.contract_id
      LEFT JOIN Devices d 
          ON d.MemberID = lg.id AND d.DeviceStyleID = 3
      LEFT JOIN DevicetControl dc 
          ON dc.MemberID = lg.id AND dc.DeviceID = d.DeviceID
      WHERE lc.site_id = :site_id
      ORDER BY lc.site_id, lg.id, d.DeviceID;
    `;

    const rows = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });

    const gatewaySet = new Set();
    const deviceSet = new Set();
    let key;
    let deviceOffline = 0;
    let deviceOnline = 0;

    rows.forEach((row) => {
      gatewaySet.add(row.gateway_id);
      key = `${row.gateway_id}-${row.device_id}`;
      deviceSet.add(key);

      if (row.control_id == 0) {
        if (row.last_value == 0) {
          deviceOffline++;
        } else if (row.last_value == 1) {
          deviceOnline++;
        }
      }
    });

    return {
      gwTotal: gatewaySet.size,
      gwOffline: 0,
      gwOnline: 0,
      deviceTotal: deviceSet.size,
      deviceOffline,
      deviceOnline,
      // raw: rows,
    };
  } catch (err) {
    console.error("Error in summaryOverviews:", err);
    throw err;
  }
};

exports.getOverviews = async (req, res) => {
  try {
    const site_id = req.site.site_id;
    const data = await summaryOverviews(site_id);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};

exports.getMaintenanceLog = async (req, res) => {
  try {
    const site_id = req.site.site_id;
    const data = await maintenanceListComplete(site_id);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};

exports.getMembers = async (req, res) => {
  try {
    const site_id = req.site.site_id;
    const member_id = req.member.id;
    const site_role = req.site.site_role;
    const data = await membersList(site_id, member_id, site_role);
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.sitesListWithMemberId = async (req, res) => {
  try {
    const result = await siteListWithMemberID(req.member);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.siteListWithId = async (req, res) => {
  try {
    const result = await sitesList(req.site.site_id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.DeviceListInSite = async (req, res) => {
  try {
    const result = await siteWithDevices(req.site.site_id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};
