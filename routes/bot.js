const express = require("express");
const telegram = require("../TelegramBot");

const router = express.Router();

router.post("/telegram", async (req, res) => {
  await telegram.bot.processUpdate(req.body);
  res.status(200).send("good");
});

module.exports = router;
