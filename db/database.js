const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("telegram-db", "xtralargex", "Python*90", {
  dialect: "sqlite",
  host: "./dev.sqlite",
});

module.exports = sequelize;
