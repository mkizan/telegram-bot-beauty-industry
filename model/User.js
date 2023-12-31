const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db/database");

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
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
    birthday: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    cardCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    cardName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    cardOwner: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    discontCardType: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    priceType: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  },
  {
    sequelize,
    modelName: "user",
  }
);

module.exports = User;
