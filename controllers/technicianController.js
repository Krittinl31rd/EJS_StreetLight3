const i18n = require("i18n");
const sequelize = require("../config/sequelize");
const technicianLayout = "../views/layouts/technician";
const { allRole, allEnabled, allRoleSite } = require("../helpers/routeAccess");
const { GetFormattedDate } = require("../helpers/dateHelper");

exports.AllSiteTechnicianPage = async (req, res) => {
  const site_role = null;
  res.render("technician/all_sites", {
    layout: technicianLayout,
    tab: "technician_sites",
    title: "Technician | LeKise The Lamp",
    currentRoute: "/technician/sites",
    member: req.member,
    messages: req.flash(),
    sites: await siteListMapMemberID(req.member),
    site_role,
  });
};

exports.TechnicianHome = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const [siteName] = await getSiteName(site_id);
  res.render("technician/home", {
    layout: technicianLayout,
    title: `Technician | ${site_name}`,
    currentRoute: `/dashboard`,
    member: req.member,
    messages: req.flash(),
    site_role,
    site_label,
    siteName,
  });
};

exports.TechnicianMaintenance = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("technician/maintenance", {
    layout: technicianLayout,
    title: `Technician | ${site_name}`,
    currentRoute: `/maintenance`,
    member: req.member,
    messages: req.flash(),
    site_role,
    site_label,
    gatewayList: await gatewayListOnSite(site_id),
    deviceList: await deviceList(site_id),
  });
};

exports.TechnicianDevices = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("technician/devices", {
    layout: technicianLayout,
    title: `Technician | ${site_name}`,
    currentRoute: `/devices`,
    member: req.member,
    messages: req.flash(),
    site_role,
    site_label,
    gatewayList: await gatewayListOnSite(site_id),
  });
};

exports.TechnicianEditDevices = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  res.render("technician/edit_devices", {
    layout: technicianLayout,
    title: `Technician | ${site_name}`,
    currentRoute: `/edit_devices`,
    member: req.member,
    message: req.flash(),
    site_role,
    site_label,
    deviceList: await gatewayDeviceList(site_id),
  });
};

exports.AddMaintenance = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const { id } = req.member;
  const {
    gateway_id,
    device_id,
    maintenance_date,
    maintenance_type,
    description,
  } = req.body;
  try {
    const queryInsert = `
            INSERT INTO Lamp_Maintenance (gateway_id, device_id, maintenance_date, maintenance_type, description, technician_id, status, site_id)
            VALUES (:gateway_id, :device_id, :maintenance_date, :maintenance_type, :description, :technician_id, :status, :site_id)`;
    await sequelize.query(queryInsert, {
      replacements: {
        gateway_id,
        device_id,
        maintenance_date,
        maintenance_type,
        description,
        technician_id: id,
        status: "Completed",
        site_id: site_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });
    res.status(200).json({ message: "Successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internet Server Error" });
  }
};

exports.EditDevice = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const { gateway_id, device_id, device_name, lat, long } = req.body;
  try {
    if (device_id == 0) {
      const querySearch = `
            SELECT * FROM Lamp_Gateways WHERE gateway_name = :device_name AND id != :gateway_id`;
      const result = await sequelize.query(querySearch, {
        replacements: {
          gateway_id,
          device_name,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (result.length > 0) {
        return res
          .status(400)
          .json({ message: "Gateway name already exists." });
      }
      const queryUpdate = `
             UPDATE Lamp_Gateways SET gateway_name=:gateway_name, lat=:lat, long=:long WHERE id = :gateway_id`;
      await sequelize.query(queryUpdate, {
        replacements: {
          gateway_id,
          gateway_name: device_name,
          lat,
          long,
        },
        type: sequelize.QueryTypes.INSERT,
      });
      res.status(200).json({ message: "Updated Successfully." });
    } else {
      const querySearch = `SELECT * FROM Devices WHERE DeviceName = :device_name AND MemberID = :gateway_id AND DeviceID != :device_id`;
      const result = await sequelize.query(querySearch, {
        replacements: {
          device_name,
          gateway_id,
          device_id,
        },
        type: sequelize.QueryTypes.SELECT,
      });
      if (result.length > 0) {
        return res.status(400).json({ message: "Device name already exists." });
      }
      const queryUpdate = `
            UPDATE Devices SET DeviceName=:device_name, lat=:lat, long=:long WHERE MemberID = :gateway_id AND DeviceID = :device_id`;
      await sequelize.query(queryUpdate, {
        replacements: {
          device_name,
          gateway_id,
          device_id,
          lat,
          long,
        },
        type: sequelize.QueryTypes.INSERT,
      });
      res.status(200).json({ message: "Updated Successfully." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internet Server Error" });
  }
};

exports.AddDevices = async (req, res) => {
  const { site_id, site_label, site_name, site_role } = req.site;
  const allDevicesData = req.body;
  try {
    if (allDevicesData.length > 0) {
      const existingDevices = [];

      const promises = allDevicesData.map(async (item) => {
        const checkQuery = `SELECT * FROM Devices WHERE MemberID = :MemberID AND DeviceID = :DeviceID`;
        const result = await sequelize.query(checkQuery, {
          replacements: {
            MemberID: item.MemberID,
            DeviceID: item.DeviceID,
          },
          type: sequelize.QueryTypes.SELECT,
        });
        if (result.length > 0) {
          existingDevices.push({
            MemberID: item.MemberID,
            DeviceID: item.DeviceID,
          });
          return;
        }
        const queryInsert = `
                    INSERT INTO Devices (MemberID, DeviceID, DeviceStyleID, DeviceName, device_address, lat, long)
                    VALUES (:MemberID, :DeviceID, :DeviceStyleID, :DeviceName, :device_address, :lat, :long)
                `;
        await sequelize.query(queryInsert, {
          replacements: {
            MemberID: item.MemberID,
            DeviceID: item.DeviceID,
            DeviceStyleID: 3,
            DeviceName: item.DeviceName,
            device_address: item.device_address,
            lat: 13.509104,
            long: 100.60753,
          },
          type: sequelize.QueryTypes.INSERT,
        });

        const queryInsertDeviceControl = `
                    INSERT INTO DevicetControl (MemberID, DeviceID, ControlID, ConTypeID, Label, LastValue)
                    VALUES 
                        (:MemberID, :DeviceID, 0, 1, 'online', 0),
                        (:MemberID, :DeviceID, 1, 1, 'dimmer', 0),
                        (:MemberID, :DeviceID, 2, 1, 'Status', 0),
                        (:MemberID, :DeviceID, 10, 1, 'batt', 0),
                        (:MemberID, :DeviceID, 11, 1, 'temp', 0),
                        (:MemberID, :DeviceID, 12, 1, 'charge', 0),
                        (:MemberID, :DeviceID, 13, 1, 'solarpower/volt', 0),
                        (:MemberID, :DeviceID, 14, 1, 'solarpower/current', 0),
                        (:MemberID, :DeviceID, 15, 1, 'powerout/volt', 0),
                        (:MemberID, :DeviceID, 16, 1, 'powerout/current', 0),
                        (:MemberID, :DeviceID, 17, 1, 'batt_volt/mv', 0),
                        (:MemberID, :DeviceID, 18, 1, 'capacity', 0),
                        (:MemberID, :DeviceID, 19, 1, 'batt_health', 0),
                        (:MemberID, :DeviceID, 20, 1, 'cycle_count', 0)
                `;
        await sequelize.query(queryInsertDeviceControl, {
          replacements: {
            MemberID: item.MemberID,
            DeviceID: item.DeviceID,
          },
          type: sequelize.QueryTypes.INSERT,
        });
      });
      await Promise.all(promises);

      if (existingDevices.length > 0) {
        return res.status(400).json({
          message: `Some devices already exist: ${existingDevices
            .map(
              (device) =>
                `GatewayID: ${device.MemberID}, DeviceID: ${device.DeviceID}`
            )
            .join(" | ")}`,
        });
      }
      res.status(200).json({ message: "Successfully." });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internet Server Error");
  }
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

const gatewayDeviceList = async (site_id) => {
  const query = `
    SELECT
        lg.id AS gateway_id,
        lg.gateway_name AS gateway_name,
        lg.lat AS gateway_lat,
        lg.long AS gateway_long,
        d.DeviceID AS device_id,
        d.DeviceName AS device_name,
        d.lat AS device_lat,
        d.long AS device_long,
        d.device_address AS device_address
    FROM Lamp_Contracts lc
    JOIN Lamp_Gateways lg ON lc.id = lg.contract_id
    LEFT JOIN Devices d ON d.MemberID = lg.id AND d.DeviceStyleID = 3
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
        gateway_id: row.gateway_id,
        gateway_name: row.gateway_name,
        device_id: 0,
        device_name: null,
        lat: row.gateway_lat,
        long: row.gateway_long,
        device_address: null,
        type: "gateway",
      });
    }

    if (row.device_id) {
      const deviceKey = `${row.gateway_id}_${row.device_id}`;

      if (!deviceMap[deviceKey]) {
        deviceMap[deviceKey] = {
          gateway_id: row.gateway_id,
          gateway_name: row.gateway_name,
          device_id: row.device_id,
          device_name: row.device_name,
          lat: row.device_lat,
          long: row.device_long,
          device_address: row.device_address,
          type: "device",
        };
        output.push(deviceMap[deviceKey]);
      }
    }
  });

  return output;
};

const deviceList = async (site_id) => {
  try {
    const query = `
        SELECT
            d.DeviceID AS device_id,
            d.DeviceName AS device_name,
            d.lat AS lat,
            d.long AS long
        FROM Lamp_Contracts lc
        JOIN Lamp_Gateways lg ON lc.id=lg.contract_id
        LEFT JOIN Devices d ON d.MemberID = lg.id AND d.DeviceStyleID = 3
        LEFT JOIN Lamp_Group_Mapping lgm ON lgm.gateway_id = lg.id AND lgm.device_id = d.DeviceID
        LEFT JOIN Lamp_Groups lgp ON lgm.group_id = lgp.id
        WHERE lc.site_id = :site_id
        ORDER BY lg.id, d.DeviceID;`;

    const result = await sequelize.query(query, {
      replacements: { site_id },
      type: sequelize.QueryTypes.SELECT,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

const siteListMapMemberID = async (payload) => {
  try {
    const query = `
            SELECT 
                ls.id AS site_id, 
                ls.name AS site_name,
                ls.description AS description,
                ls.label AS label
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

//        INSERT INTO Devices (MemberID, DeviceID, DeviceStyleID, DeviceName, device_address, lat, long)
//        VALUES (5, 2008, 3, 'dim 2008', 'd2001ab809fd', 13.774953, 100.606706);

//  INSERT INTO DevicetControl (MemberID, DeviceID, ControlID, ConTypeID, Label, LastValue)
//               VALUES
//                   (5, 2008, 0, 1, 'online', 0),
//                   (5, 2008, 1, 1, 'dimmer', 0),
//                   (5, 2008, 2, 1, 'Status', 0),
//                   (5, 2008, 10, 1, 'batt', 0),
//                   (5, 2008, 11, 1, 'temp', 0),
//                   (5, 2008, 12, 1, 'charge', 0),
//                   (5, 2008, 13, 1, 'solarpower/volt', 0),
//                   (5, 2008, 14, 1, 'solarpower/current', 0),
//                   (5, 2008, 15, 1, 'powerout/volt', 0),
//                   (5, 2008, 16, 1, 'powerout/current', 0),
//                   (5, 2008, 17, 1, 'batt_volt/mv', 0),
//                   (5, 2008, 18, 1, 'capacity', 0),
//                   (5, 2008, 19, 1, 'batt_health', 0),
//                   (5, 2008, 20, 1, 'cycle_count', 0)
