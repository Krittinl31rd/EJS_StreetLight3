const { Sequelize } = require("sequelize");

// Set up Sequelize with MySQL connection
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'mysql',
//     logging: false,
// });

const sequelize = new Sequelize("IOTServer_Lekise", "sa", "Archi_123456", {
  // host: "archismarthome.com",
  // host: "127.0.0.1",
  host: "100.76.74.10",
  dialect: "mssql",
  logging: false,
  port: 1433,
  // port: 11230,
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to SQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

testConnection();

module.exports = sequelize;
