const { btn } = require("../constants/keyboard");

const arrayButtons = [
  [btn.MY_CARD, btn.PROMOTION],
  [btn.STORES, btn.SOCIAL],
  [btn.REGISTER_CARD],
];

const keyboard = {
  reply_markup: {
    keyboard: arrayButtons,
    resize_keyboard: true,
  },
};

module.exports = { arrayButtons, keyboard };
