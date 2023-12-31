const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/database");

class Contact extends Model {}

Contact.init(
  {
    user_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      unique: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    messenger: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  },
  {
    sequelize,
    modelName: "contact",
  }
);

module.exports = Contact;
