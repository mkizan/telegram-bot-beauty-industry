const { btn } = require("./keyboard");
require("dotenv").config();

const { COMPANY_NAME } = process.env;

const msgForUser = Object.freeze({
  WELCOME: `Ласкаво просимо😊, в телеграм-бот компанії "${COMPANY_NAME}"!\n\nДля роботи в цьому чат-боті, будь ласка надайте доступ до ваших контактів, натиснувши кнопку "${btn.SHARE_PHONE}"`,
  ACCESS_TO_CONTACTS:
    "Будь ласка, надайте свій номер телефону в телеграм для подальшої роботи з цим ботом",
  INSTRUCTION: `Інструкція для користувачів ботом:\n\n${btn.MY_CARD} - отримати штрих-код вашої картки клієнта\n\n${btn.PROMOTION} - переглянути діючі акції для Вас\n\n${btn.STORES} - надає інформацію щодо місцезнаходження мережі магазинів "Професійна Краса"\n\n${btn.SOCIAL} - надає можливість перейти в наш інтернет-магазин чи instagram\n\n${btn.REGISTER_CARD} - подати заявку на оформлення картки клієнта`,
  CARD_NOT_FOUND: `Вибачте, ми не можемо знайти вашу картку за вашим номером телефону в телеграм.\n\nСкоріш за все в нашій базі даних записаний інший ваш номер телефону, аніж зареєстрований у телеграм або у вас ще немає картки.\n\nЯкщо у вас ще немає картки, то будь ласка натисніть кнопку "${btn.REGISTER_CARD}", в іншому випадку - зателефонуйте нам 0956616362 | 0682896068`,
  UNKNOWN_ERROR: "Сталася невідома помилка",
  NO_PROMO: "На сьогодні відсутні акції",
  CARD_EXIST: `У вас вже є картка. Натисніть кнопку "${btn.MY_CARD}", щоб отримати штрих-код картки.\n\nЯкщо у вас виникли питання щодо роботи нашого бота, зверніться на гарячу лінію за телефонами 0682896068 | 0956616362`,
  REGISTER_COMPLETE: "Дякуємо, наш працівник зв'яжиться з вами",
  SHOW_BARCODE: "Покажіть штрих-код продавцю для пошуку вас у нашій базі даних",
});

module.exports = { msgForUser };
