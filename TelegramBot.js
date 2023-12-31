const path = require("path");
const { isWithinInterval } = require("date-fns");
const fs = require("fs").promises;
const TelegramBot = require("node-telegram-bot-api");
const bwipjs = require("bwip-js");
const User = require("./model/User");
const Contact = require("./model/Contact");
const { keyboard } = require("./utils/keyboard");
const { storesKeyboard, socialKeyboard } = require("./utils/inlineKeyboard");
const { btn } = require("./constants/keyboard");
const { question } = require("./constants/question");
const { userId } = require("./constants/userId");
const { msgForUser } = require("./constants/message");
const price = require("./constants/priceType");
const api1s = require("./services/api1s");

require("dotenv").config();
const { TELEGRAM_TOKEN, PORT, SERVER_URL } = process.env;

const bot = new TelegramBot(TELEGRAM_TOKEN, {
  webHook: {
    port: PORT,
  },
});

// встановлюємо адресу для роботи telegram
bot.setWebHook(`https://${SERVER_URL}/bot/telegram`);

// Обробник подій для команди /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  // Відправка повідомлення з клавіатурою
  return bot.sendMessage(chatId, msgForUser.WELCOME, {
    reply_markup: {
      keyboard: [[{ text: btn.SHARE_PHONE, request_contact: true }]],
      resize_keyboard: true,
    },
  });
});

bot.onText(/\/keyboard/, (msg) => {
  const chatId = msg.chat.id;
  return bot.sendMessage(chatId, "Повернув клавіатуру😇", keyboard);
});

bot.on("contact", async (msg) => {
  bot.setMyCommands([
    { command: "/start", description: "виправлення неполадок з ботом" },
    { command: "/keyboard", description: "показати клавіатуру бота" },
  ]);

  try {
    const chatId = msg.chat.id;
    const userContact = msg.contact;

    const isUserExist = await Contact.findOne({ where: { user_id: chatId } });
    // якщо клієнт досі не стартував у нашому боті, то додаємо його в проміжну таблицю (ContactTable)
    if (!isUserExist) {
      // додаємо ще дані з властивостей повідомлення, бо їх немає в контактах
      if (userContact.phone_number === null) {
        return bot.sendMessage(chatId, msgForUser.ACCESS_TO_CONTACTS, {
          reply_markup: {
            keyboard: [
              [
                {
                  text: btn.SHARE_PHONE,
                  request_contact: true,
                },
              ],
            ],
            resize_keyboard: true,
          },
        });
      }
      if (userContact.phone_number.length === 13) {
        userContact.phone_number = userContact.phone_number.substring(3);
        console.log(userContact);
      }
      if (userContact.phone_number.length === 12) {
        userContact.phone_number = userContact.phone_number.substring(2);
      }
      if (userContact.phone_number.length === 11) {
        userContact.phone_number = userContact.phone_number.substring(1);
      }
      userContact.last_name = msg.from?.last_name;
      userContact.username = msg.from?.username;
      userContact.messenger = "telegram";
      await Contact.create(userContact);
      return bot.sendMessage(chatId, msgForUser.INSTRUCTION, keyboard);
    }
    return bot.sendMessage(chatId, msgForUser.INSTRUCTION, keyboard);
  } catch (error) {
    console.log(error);
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Обробка тексту, отриманого при натисканні на кнопку
  switch (msg.text) {
    case btn.MY_CARD:
      try {
        // шукаємо контакти клієнта в SQLite БД
        const userFromUserTable = await User.findOne({
          where: { user_id: chatId },
        });

        if (userFromUserTable) {
          // отримуємо користувача з SQLite БД і видаємо згенерований ШК
          generateAndSendBarcode(chatId, userFromUserTable);
        } else if (!userFromUserTable) {
          // шукаємо всіх контрагентів в Contact Table
          const { dataValues } = await Contact.findOne({
            where: { user_id: chatId },
          });

          // шукаємо всіх контрагентів в 1с
          const cards = await api1s.getAllCards();
          const userInfo = cards.find(
            (card) =>
              card.phone === dataValues.phone_number ||
              card.personalPhone === dataValues.phone_number
          );

          // якщо клієнт знайдений в БД 1с, то додаємо його в SQLite БД і видаємо згенерований ШК
          if (userInfo) {
            dataValues.birthday = userInfo?.birthday;
            dataValues.cardCode = userInfo.cardCode;
            dataValues.cardName = userInfo.name;
            dataValues.cardOwner = userInfo.cardOwner;
            dataValues.discontCardType = userInfo?.discontCardType;
            dataValues.priceType =
              userInfo.priceType === price.SALON ? price.SALON : price.MARKET;
            console.log(dataValues?.priceType);

            await User.create(dataValues);
            generateAndSendBarcode(chatId, dataValues);
          } else {
            bot.sendMessage(chatId, msgForUser.CARD_NOT_FOUND, keyboard);
            return bot.sendMessage(
              userId.ADMIN,
              `Клієнт ${dataValues.user_id} ${dataValues?.last_name} ${dataValues?.first_name} з телефоном ${dataValues?.phone_number} намагався отримати ШК картки`
            );
          }
        } else {
          return bot.sendMessage(chatId, msgForUser.UNKNOWN_ERROR, keyboard);
        }
      } catch (error) {
        console.log(error);
      }
      break;
    case btn.PROMOTION:
      try {
        const userFromUserTable = await User.findOne({
          where: { user_id: chatId },
        });

        const promoNewYearInterval = isWithinInterval(new Date(), {
          start: new Date(2023, 11, 30),
          end: new Date(2024, 0, 8),
        });

        const promoElectrikaInterval = isWithinInterval(new Date(), {
          start: new Date(2023, 11, 22),
          end: new Date(2023, 11, 31),
        });

        if (!userFromUserTable || userFromUserTable.priceType !== price.SALON) {
          if (promoElectrikaInterval) {
            sendPromoVideo(chatId, "D:/FTP/Акції/bot/market/video/електрика");
          }
          if (promoNewYearInterval) {
            // sendPromoPhoto(chatId, "D:/FTP/Акції/bot/market/photo/косметика");
            sendPromoVideo(chatId, "D:/FTP/Акції/bot/market/video/косметика");
          }

          if (!promoNewYearInterval && !promoElectrikaInterval) {
            return bot.sendMessage(chatId, msgForUser.NO_PROMO, keyboard);
          }
        } else {
          if (promoElectrikaInterval) {
            sendPromoVideo(chatId, "D:/FTP/Акції/bot/salon/video/електрика");
          }
          if (promoNewYearInterval) {
            // sendPromoPhoto(chatId, "D:/FTP/Акції/bot/salon/photo/косметика");
            sendPromoVideo(chatId, "D:/FTP/Акції/bot/salon/video/косметика");
          }

          if (!promoNewYearInterval && !promoElectrikaInterval) {
            return bot.sendMessage(chatId, msgForUser.NO_PROMO, keyboard);
          }
        }
      } catch (error) {
        console.log(error);
      }
      break;
    case btn.STORES:
      bot.sendMessage(chatId, "🛍Перелік магазинів:", storesKeyboard);
      break;
    case btn.SOCIAL:
      bot.sendMessage(chatId, "Переходьте за посиланнями:", socialKeyboard);
      break;
    case btn.REGISTER_CARD:
      const userData = {
        last_name: null,
        first_name: null,
        phone_number: null,
        birthday: null,
        settlement: null,
        master: null,
        salon: null,
        address: null,
      };
      try {
        const userFromUserTable = await User.findOne({
          where: { user_id: chatId },
        });

        const { dataValues } = await Contact.findOne({
          where: { user_id: chatId },
        });

        console.log(dataValues);

        // отримуємо всіх контрагентів в 1с
        const cards = await api1s.getAllCards();
        // console.log(cards);
        const userInfo = cards.find(
          (card) =>
            card.phone === dataValues.phone_number ||
            card.personalPhone === dataValues.phone_number
        );

        if (userInfo) {
          return bot.sendMessage(chatId, msgForUser.CARD_EXIST);
        }

        // якщо користувач є в таблиці User, то повідомляємо користувача, що він уже зареєстрований і завершуємо програму
        if (userFromUserTable?.dataValues) {
          return bot.sendMessage(chatId, msgForUser.CARD_EXIST);
        }

        const lastNamePrompt = await bot.sendMessage(
          chatId,
          question.LASTNAME,
          { reply_markup: { force_reply: true } }
        );

        bot.onReplyToMessage(
          chatId,
          lastNamePrompt.message_id,
          async (lastNameMsg) => {
            userData.last_name = lastNameMsg.text;
            const firstNamePrompt = await bot.sendMessage(
              chatId,
              question.FIRSTNAME,
              { reply_markup: { force_reply: true } }
            );

            bot.onReplyToMessage(
              chatId,
              firstNamePrompt.message_id,
              async (firstNameMsg) => {
                userData.first_name = firstNameMsg.text;
                const birthdayPrompt = await bot.sendMessage(
                  chatId,
                  question.BIRTHDAY,
                  { reply_markup: { force_reply: true } }
                );
                bot.onReplyToMessage(
                  chatId,
                  birthdayPrompt.message_id,
                  async (birthdayMsg) => {
                    userData.birthday = birthdayMsg.text;
                    const settlementPrompt = await bot.sendMessage(
                      chatId,
                      question.SETTLEMENT,
                      { reply_markup: { force_reply: true } }
                    );

                    bot.onReplyToMessage(
                      chatId,
                      settlementPrompt.message_id,
                      async (settlementMsg) => {
                        userData.settlement = settlementMsg.text;
                        const masterPrompt = await bot.sendMessage(
                          chatId,
                          question.IS_MASTER,
                          {
                            reply_markup: {
                              force_reply: true,
                              // keyboard: [[btn.YES, btn.NO]],
                              // resize_keyboard: true,
                            },
                          }
                        );
                        bot.onReplyToMessage(
                          chatId,
                          masterPrompt.message_id,
                          async (masterMsg) => {
                            userData.master = masterMsg.text.toLowerCase();
                            if (userData.master === "так") {
                              const salonPrompt = await bot.sendMessage(
                                chatId,
                                question.NAME_BEAUTY_SALON,
                                { reply_markup: { force_reply: true } }
                              );
                              bot.onReplyToMessage(
                                chatId,
                                salonPrompt.message_id,
                                async (salonMsg) => {
                                  userData.salon = salonMsg.text;
                                  const addressPrompt = await bot.sendMessage(
                                    chatId,
                                    question.ADDRESS_BEAUTY_SALON,
                                    { reply_markup: { force_reply: true } }
                                  );
                                  bot.onReplyToMessage(
                                    chatId,
                                    addressPrompt.message_id,
                                    async (addressMsg) => {
                                      userData.address = addressMsg.text;
                                      bot.sendMessage(
                                        chatId,
                                        msgForUser.REGISTER_COMPLETE,
                                        keyboard
                                      );
                                      bot.sendMessage(
                                        userId.MODERATOR,
                                        `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}\nНазва салону: ${userData?.salon}\nАдреса салону: ${userData?.address}`
                                      );
                                      return bot.sendMessage(
                                        userId.ADMIN,
                                        `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}\nНазва салону: ${userData?.salon}\nАдреса салону: ${userData?.address}`
                                      );
                                    }
                                  );
                                }
                              );
                            } else if (userData.master === "ні") {
                              bot.sendMessage(
                                chatId,
                                msgForUser.REGISTER_COMPLETE,
                                keyboard
                              );
                              bot.sendMessage(
                                userId.MODERATOR,
                                `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}`
                              );
                              return bot.sendMessage(
                                userId.ADMIN,
                                `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}`
                              );
                            } else {
                              //якщо відповідь клієнта не Так і не Ні, то наголошуємо, що відповідь повинна бути саме Так або Ні (і знову та сама подальша логіка)
                              const isMasterPrompt = await bot.sendMessage(
                                chatId,
                                question.SHORT_ANSWER,
                                { reply_markup: { force_reply: true } }
                              );
                              bot.onReplyToMessage(
                                chatId,
                                isMasterPrompt.message_id,
                                async (isMasterMsg) => {
                                  userData.master =
                                    isMasterMsg.text.toLowerCase();
                                  if (userData.master === "так") {
                                    const salonPrompt = await bot.sendMessage(
                                      chatId,
                                      question.NAME_BEAUTY_SALON,
                                      { reply_markup: { force_reply: true } }
                                    );
                                    bot.onReplyToMessage(
                                      chatId,
                                      salonPrompt.message_id,
                                      async (salonMsg) => {
                                        userData.salon = salonMsg.text;
                                        // console.log(userData);
                                        const addressPrompt =
                                          await bot.sendMessage(
                                            chatId,
                                            question.ADDRESS_BEAUTY_SALON,
                                            {
                                              reply_markup: {
                                                force_reply: true,
                                              },
                                            }
                                          );
                                        bot.onReplyToMessage(
                                          chatId,
                                          addressPrompt.message_id,
                                          async (addressMsg) => {
                                            userData.address = addressMsg.text;
                                            // console.log(userData);
                                            bot.sendMessage(
                                              chatId,
                                              msgForUser.REGISTER_COMPLETE,
                                              keyboard
                                            );
                                            bot.sendMessage(
                                              userId.MODERATOR,
                                              `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}\nНазва салону: ${userData?.salon}\nАдреса салону: ${userData?.address}`
                                            );
                                            return bot.sendMessage(
                                              userId.ADMIN,
                                              `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}\nНазва салону: ${userData?.salon}\nАдреса салону: ${userData?.address}`
                                            );
                                          }
                                        );
                                      }
                                    );
                                  } else {
                                    bot.sendMessage(
                                      chatId,
                                      msgForUser.REGISTER_COMPLETE,
                                      keyboard
                                    );
                                    bot.sendMessage(
                                      userId.MODERATOR,
                                      `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}`
                                    );
                                    return bot.sendMessage(
                                      userId.ADMIN,
                                      `Заявка на реєстрацію картки клієнта\n\nПрізвище: ${userData.last_name}\nІм'я: ${userData.first_name}\nНомер телефону: ${dataValues.phone_number}\nДата народження: ${userData.birthday}\nНаселений пункт: ${userData.settlement}\nМайстер? - ${userData.master}`
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.log(error);
      }
      break;
  }
});

async function sendPromoVideo(chatId, dirPath) {
  const directoryPath = path.join(dirPath);
  try {
    const files = await fs.readdir(directoryPath);

    files.forEach((file) => {
      let videoFile = path.join(directoryPath, file);
      bot.sendVideo(chatId, videoFile);
    });
  } catch (error) {
    console.log(error);
  }
}

async function sendPromoPhoto(chatId, dirPath) {
  const directoryPath = path.join(dirPath);
  try {
    const files = await fs.readdir(directoryPath);

    files.forEach((file) => {
      let photoFile = path.join(directoryPath, file);
      bot.sendPhoto(chatId, photoFile);
    });
  } catch (error) {
    console.log(error);
  }
}

function generateAndSendBarcode(chatId, info, barcodeType = "ean13") {
  // Генеруємо штрихкод за значенням "cardCode"
  bwipjs.toBuffer(
    {
      bcid: barcodeType.toLowerCase(), // Тип штрихкоду (може бути іншим)
      text: info.cardCode,
      scale: 3, // Масштаб штрихкоду
      height: 15, // Висота штрихкоду
      includetext: false, // Додає текст на штрихкод
      textxalign: "center", // Вирівнювання тексту по горизонталі
      textyalign: "bottom", // Вирівнювання тексту по вертикалі (внизу)
    },
    function (err, png) {
      if (err) {
        console.log(err.message);
        return;
      }

      // Додаємо текст з номером інфокартки під штрихкодом
      // const caption = `${userInfo.cardCode}`;

      // Відправляємо зображення штрихкоду в телеграм разом із текстом
      bot.sendMessage(chatId, msgForUser.SHOW_BARCODE);
      return bot.sendPhoto(chatId, png);
      // bot.sendPhoto(chatId, png, { caption });
    }
  );
}

module.exports = { bot };

// const infoCards = JSON.parse(fs.readFileSync("./db.json", "utf8")).infoCards;
// const myCards = JSON.parse(fs.readFileSync("./getcards.json", "utf8")).cards;
// console.log(myCards);

// app.get("/cards", async (_, res) => {
//   const resApi = await api1s.getAllCards();
//   // console.log(resApi.cards.filter((card) => card.phone === ""));
//   const arrayCards = resApi.cards.filter((card) => card.phone === "");
//   res.status(200).send({ arrayCards });
// });

// звертаємося до API 1с
// const resApi = await api1s.getAllCards();
// console.log(resApi.cards.filter((card) => card.phone === ""));
// const arrayCards = resApi.cards.filter((card) => card.phone === "");
// console.log(arrayCards.length);

// console.log(arrayCards.push(resApi));
// console.log(arrayCards);

// const outputFilePath = "output.json";
// const filteredCards = myCards.filter((card) => card.phone === "");
// console.log(filteredCards);
// fs.writeFileSync(outputFilePath, JSON.stringify(arrayCards));

// const newData = {
//   username: msg.from?.username,
//   cardCode: userInfo.cardCode,
//   rate: userInfo?.rate,
//   cardName: userInfo.name,
//   cardType: userInfo.cardType,
//   cardOwner: userInfo.cardOwner,
//   discontCardType: userInfo?.discontCardType,
//   priceType: userInfo?.priceType,
// };
// await User.update(newData, {
//   where: {
//     user_id: userInfo.user_id,
//   },
// });
