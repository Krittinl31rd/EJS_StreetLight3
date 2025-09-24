const sequelize = require("../config/sequelize");
const { GetFormattedDate } = require("../helpers/dateHelper");

exports.LampNotificiation = async (req, res) => {
  try {
    const {} = req.body;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, msg: "Internal Server Error" });
  }
};

// 1 lamp = 1440 log per day
exports.LampLog = async (req, res) => {
  try {
    const { device_id, input, output, battery, env, timestamp } = req.body;

    const querySearch = `SELECT DeviceID, MemberID FROM Devices WHERE device_address = :device_id`;
    const [existing] = await sequelize.query(querySearch, {
      replacements: { device_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existing) {
      return res.status(500).json({ status: 0, msg: "Device not found" });
    }

    const queryGateway = `
            SELECT lc.site_id, lg.id AS gateway_id
            FROM Lamp_Gateways lg
            JOIN Lamp_Contracts lc ON lg.contract_id = lc.id
            WHERE lg.id = :gateway_id
        `;
    const [gateway] = await sequelize.query(queryGateway, {
      replacements: { gateway_id: existing.MemberID },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!gateway) {
      return res.status(500).json({ status: 0, msg: "Gateway not found" });
    }

    const log = {
      gateway_id: gateway.gateway_id,
      device_id: existing.DeviceID,
      input,
      output,
      battery,
      env,
      timestamp,
    };

    const queryInsert = `
            INSERT INTO Lamp_Log (type, detail, control_by, created_at, site_id)
            VALUES (:type, :detail, :control_by, :created_at, :site_id)
        `;
    await sequelize.query(queryInsert, {
      replacements: {
        type: "log",
        detail: JSON.stringify([log]),
        control_by: gateway.gateway_id,
        created_at: GetFormattedDate(),
        site_id: gateway.site_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    return res.status(200).json({ status: 1, msg: "Success" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, msg: "Internal Server Error" });
  }
};

exports.InsertUsageFromGateway = async (req, res) => {
  try {
    //to db [{"gateway_id":5,"gateway_name":"gateway1","device_id":2001,"device_name":"Dimming","control_id":1,"control_name":"dimmer","V":5}]
    //  [{"gateway_id":5,"device_id":2001,"input":{"volt":0,"current":0},"output":{"volt":0,"current":0},"battery":{"batt_volt":13.52,"capacity":34.62,"health":100,"cycle":74,"level":100,"charge":0},"env":{"temp":25.6,"humid":0},"timestamp":"2025-05-28T08:11:04.000Z"}]
    const { gateway_id, device_id, control_id, value } = req.body;
    const queryGateway = `
            SELECT lc.site_id, lg.id AS gateway_id, lg.gateway_name 
            FROM Lamp_Gateways lg
            JOIN Lamp_Contracts lc ON lg.contract_id = lc.id
            WHERE lg.id = :gateway_id
        `;
    const [gateway] = await sequelize.query(queryGateway, {
      replacements: { gateway_id: gateway_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!gateway) {
      return res.status(500).json({ status: 0, msg: "Gateway not found" });
    }

    const queryDevice = `
  SELECT dev.*, ctrl.*
  FROM Devices dev
  JOIN DevicetControl ctrl 
    ON ctrl.MemberID = dev.MemberID
   AND ctrl.DeviceID = dev.DeviceID
  WHERE dev.MemberID = :gateway_id
    AND dev.DeviceID = :device_id AND ctrl.ControlID = :control_id
`;

    const [device] = await sequelize.query(queryDevice, {
      replacements: { gateway_id, device_id, control_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!device) {
      return res.status(500).json({ status: 0, msg: "Device not found" });
    }

    const payload = {
      type: "usage",
      detail: JSON.stringify([
        {
          gateway_id: gateway?.gateway_id,
          gateway_name: gateway?.gateway_name,
          device_id: device?.MemberID,
          device_name: device?.DeviceName,
          control_id: device?.ControlID,
          control_name: device?.Label,
          V: value,
        },
      ]),
      control_by: gateway_id,
      site_id: gateway?.site_id,
    };

    const queryInsert = `
            INSERT INTO Lamp_Log (type, detail, control_by, created_at, site_id)
            VALUES (:type, :detail, :control_by, :created_at, :site_id)
        `;
    await sequelize.query(queryInsert, {
      replacements: {
        type: payload.type,
        detail: payload.detail,
        control_by: payload.control_by,
        created_at: GetFormattedDate(),
        site_id: payload.site_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    return res.status(200).json({ status: 1, msg: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error",
    });
  }
};

// from gw = gateway_id, device_id, value
exports.InsertLogFromGateway = async (req, res) => {
  try {
    //to db [{"gateway_id":5,"gateway_name":"gateway1","device_id":2001,"device_name":"Dimming","control_id":1,"control_name":"dimmer","V":5}]
    //  [{"gateway_id":5,"device_id":2001,"input":{"volt":0,"current":0},"output":{"volt":0,"current":0},"battery":{"batt_volt":13.52,"capacity":34.62,"health":100,"cycle":74,"level":100,"charge":0},"env":{"temp":25.6,"humid":0},"timestamp":"2025-05-28T08:11:04.000Z"}]
    const { gateway_id, device_id, input, output, battery, env, timestamp } =
      req.body;

    const queryGateway = `
            SELECT lc.site_id, lg.id AS gateway_id, lg.gateway_name 
            FROM Lamp_Gateways lg
            JOIN Lamp_Contracts lc ON lg.contract_id = lc.id
            WHERE lg.id = :gateway_id
        `;
    const [gateway] = await sequelize.query(queryGateway, {
      replacements: { gateway_id: gateway_id },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!gateway) {
      return res.status(500).json({ status: 0, msg: "Gateway not found" });
    }

    const detail = {
      gateway_id,
      device_id,
      input,
      output,
      battery,
      env,
      timestamp,
    };
    const payload = {
      type: "log",
      detail: JSON.stringify([detail]),
      control_by: gateway_id,
      site_id: gateway?.site_id,
    };

    const queryInsert = `
            INSERT INTO Lamp_Log (type, detail, control_by, created_at, site_id)
            VALUES (:type, :detail, :control_by, :created_at, :site_id)
        `;
    await sequelize.query(queryInsert, {
      replacements: {
        type: payload.type,
        detail: payload.detail,
        control_by: payload.control_by,
        created_at: GetFormattedDate(),
        site_id: payload.site_id,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    return res.status(200).json({ status: 1, msg: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error",
    });
  }
};

exports.InsertLog = async (req, res) => {
  try {
    const data = dummy();
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const transaction = await sequelize.transaction();
      try {
        const queryInsert = `
                    INSERT INTO Lamp_Log (type, detail, control_by, created_at, site_id)
                    VALUES (:type, :detail, :control_by, :created_at, :site_id)
                `;

        const logs = batch.map((device) => ({
          type: "log",
          detail: JSON.stringify([
            {
              gateway_id: 5,
              device_id: device.device_id,
              input: device.input,
              output: device.output,
              battery: device.battery,
              env: device.env,
              timestamp: device.timestamp,
            },
          ]),
          control_by: 5,
          created_at: device.timestamp.toISOString(),
          site_id: 10,
        }));

        for (const log of logs) {
          await sequelize.query(queryInsert, {
            replacements: log,
            type: sequelize.QueryTypes.INSERT,
            transaction,
          });
        }
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        console.log("Error inserting batch:", err);
        res.status(500).json({ message: "Error" });
        return;
      }
    }

    res.status(200).json({
      message: "Success",
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({
      message: "Error",
    });
  }
};

const dummy = (days = 30, entriesPerDay = 1440) => {
  const dummyData = [];
  const deviceIds = ["2001", "2002", "2003", "2004"];

  for (const device_id of deviceIds) {
    for (let i = 0; i < days; i++) {
      for (let j = 0; j < entriesPerDay; j++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(
          Math.floor(j / 60),
          j % 60,
          Math.floor(Math.random() * 60)
        );

        dummyData.push({
          device_id,
          input: {
            volt: parseFloat((12 + Math.random()).toFixed(2)),
            current: parseFloat((1 + Math.random()).toFixed(2)),
          },
          output: {
            volt: parseFloat((11.5 + Math.random()).toFixed(2)),
            current: parseFloat((1 + Math.random()).toFixed(2)),
          },
          battery: {
            batt_volt: parseFloat((12 + Math.random()).toFixed(2)),
            capacity: parseFloat(Math.random() * 100),
            health: parseFloat(Math.random() * 100),
            cycle: parseFloat(Math.random() * 100),
            level: Math.floor(Math.random() * 50),
            charge: Math.random() > 0.5 ? 1 : 0,
          },
          env: {
            temp: parseFloat((20 + Math.random() * 10).toFixed(1)),
            humid: parseFloat(0),
          },
          timestamp: date,
        });
      }
    }
  }

  return dummyData;
};

// exports.InsertLog=async (req, res) => {
//     try {
//         const data=dummy();
//         const promises=data.map(async (device) => {
//             const log={
//                 gateway_id: 5,
//                 device_id: device.device_id,
//                 input: device.input,
//                 output: device.output,
//                 battery: device.battery,
//                 env: device.env,
//                 timestamp: device.timestamp
//             };
//             const queryInsert=`
//             INSERT INTO Lamp_Log (type, detail, control_by, created_at, site_id)
//             VALUES (:type, :detail, :control_by, :created_at, :site_id)
//         `;
//             await sequelize.query(queryInsert, {
//                 replacements: {
//                     type: "log",
//                     detail: JSON.stringify([log]),
//                     control_by: 5,
//                     created_at: device.timestamp.toISOString(),
//                     site_id: 10
//                 },
//                 type: sequelize.QueryTypes.INSERT
//             });
//         })
//         await Promise.all(promises);
//         res.status(200).json({
//             message: "Success",
//         });
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({
//             message: "Error"
//         });
//     }
// }

// const dummy=(days=30, entriesPerDay=1440) => {
//     const dummyData=[];
//     const deviceIds=["2001", "2002", "2003", "2004"];

//     for (const device_id of deviceIds) {
//         for (let i=0; i<days; i++) {
//             for (let j=0; j<entriesPerDay; j++) {
//                 const date=new Date();
//                 date.setDate(date.getDate()-i);
//                 date.setHours(Math.floor(j/60), j%60, Math.floor(Math.random()*60));

//                 dummyData.push({
//                     device_id,
//                     input: {
//                         volt: parseFloat((12+Math.random()).toFixed(2)),
//                         current: parseFloat((1+Math.random()).toFixed(2))
//                     },
//                     output: {
//                         volt: parseFloat((11.5+Math.random()).toFixed(2)),
//                         current: parseFloat((1+Math.random()).toFixed(2))
//                     },
//                     battery: {
//                         level: Math.floor(50+Math.random()*50),
//                         charge: Math.random()>0.5? 1:0
//                     },
//                     env: {
//                         temp: parseFloat((20+Math.random()*10).toFixed(1)),
//                         humid: parseFloat((50+Math.random()*20).toFixed(1))
//                     },
//                     timestamp: date
//                 });
//             }
//         }
//     }

//     return dummyData;
// };

// const log={
//     gateway_id: "", //mac address
//     device_id: "", //mac address
//     input: {
//         volt: 0.00,
//         current: 0.00
//     },
//     output: {
//         volt: 0.00,
//         current: 0.00
//     },
//     battery: {
//         level: 0,
//         charge: 1,
//     },
//     env: {
//         temp: 0.00,
//         humid: 0.00
//     },
//     timestamp: "",
// }
