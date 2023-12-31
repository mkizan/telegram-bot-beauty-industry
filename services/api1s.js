const { default: axios } = require("axios");

require("dotenv").config();
const { LOGIN_AUTH_API, PWD_AUTH_API } = process.env;

axios.defaults.baseURL = "http://localhost:8580/DB_2024/hs";

const authorization = {
  username: LOGIN_AUTH_API,
  password: PWD_AUTH_API,
};

const getCard = async (cardNumber) => {
  try {
    const response = await axios.get(`/cards/getcard/${cardNumber}`, {
      auth: authorization,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getAllCards = async () => {
  try {
    const response = await axios.get("/cards/getcards", {
      auth: authorization,
    });
    return response.data.cards;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getCard, getAllCards };

// const myCards = JSON.parse(fs.readFileSync("./getCards.json", "utf8")).cards;
