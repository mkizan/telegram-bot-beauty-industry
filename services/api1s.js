const { default: axios } = require("axios");

require("dotenv").config();
const {
  LOCAL_PORT,
  DB_NAME_1C,
  AUTH_1C_ADDRESS,
  API_1C_ADDRESS,
  LOGIN_AUTH_API,
  PWD_AUTH_API,
} = process.env;

axios.defaults.baseURL = `http://localhost:${LOCAL_PORT}/${DB_NAME_1C}/${AUTH_1C_ADDRESS}`;

const authorization = {
  username: LOGIN_AUTH_API,
  password: PWD_AUTH_API,
};

const getAllCards = async () => {
  try {
    const response = await axios.get(API_1C_ADDRESS, {
      auth: authorization,
    });
    return response.data.cards;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getAllCards };
