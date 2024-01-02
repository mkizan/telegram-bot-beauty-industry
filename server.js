// const http = require("http");
// const ngrok = require("./getPublicUrl");
const express = require("express");
const cors = require("cors");
const ViberBot = require("viber-bot").Bot;
const BotEvents = require("viber-bot").Events;
const TextMessage = require("viber-bot").Message.Text;
const sequelize = require("./db/database");
const telegramRouter = require("./routes/bot");

require("dotenv").config();
const { PORT, SERVER_URL, VIBER_TOKEN } = process.env;

if (!VIBER_TOKEN) {
  console.log("Could not find bot account token key.");
  return;
}
if (!SERVER_URL) {
  console.log("Could not find exposing url");
  return;
}

sequelize
  .sync()
  .then(() => console.log("db is ready"))
  .catch((error) => console.log(error));

const bot = new ViberBot({
  authToken: VIBER_TOKEN,
  name: "Професійна Краса бот",
  avatar: "https://viber.com/avatar.jpg", // It is recommended to be 720x720, and no more than 100kb.
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_, res) => {
  res.send("<p>Server on expressjs and sqlite db</p>");
});

// Telegram webhook
app.use("/bot", telegramRouter);
// Viber bot webhook
// app.use("/bot/viber", bot.middleware());
app.post("/bot/viber", async (req, res) => {
  try {
    await bot.middleware();
    res.status(200).send("ok");
  } catch (error) {
    console.error("Error in viberBot.middleware:", error);
    res.status(500).send("my Internal Server Error");
  }
});

bot.on(BotEvents.SUBSCRIBED, (response) => {
  response.send(
    new TextMessage(
      `Hi there ${response.userProfile.name}. I am ${bot.name}! Feel free to ask me anything.`
    )
  );
});

bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
  response.send(new TextMessage(`Message received.`));
});

app.listen(PORT, () => {
  console.log(`Server is stending up and listening on port ${PORT}`);
  // await bot.setWebhook(`https://${SERVER_URL}/bot/viber`).catch((error) => {
  //   console.log("Cannot set webhook on following server. Is it running?");
  //   console.error(error);
  //   process.exit(1);
  // });
});

// return ngrok
//   .getPublicUrl()
//   .then((publicUrl) => {
//     console.log('Set the new webhook to"', publicUrl);

//     // app
//     //   .use("/bot/viber", bot.middleware())
//     //   .listen(PORT, () => bot.setWebhook(publicUrl));
//     http
//       .createServer(bot.middleware())
//       .listen(PORT, () => bot.setWebhook(publicUrl));
//   })
//   .catch((error) => {
//     console.log("Can not connect to ngrok server. Is it running?");
//     console.error(error);
//   });
