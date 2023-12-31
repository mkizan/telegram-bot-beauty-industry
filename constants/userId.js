require("dotenv").config();

const { ADMIN_USER_ID, MODERATOR_USER_ID } = process.env;

const userId = Object.freeze({
  ADMIN: ADMIN_USER_ID,
  MODERATOR: MODERATOR_USER_ID,
});

module.exports = { userId };
