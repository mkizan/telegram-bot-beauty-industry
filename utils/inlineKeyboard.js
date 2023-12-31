const storesKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Івано-Франківськ | вул. Галицька, 24",
          url: "https://www.google.com/maps/place/%D0%9F%D1%80%D0%BE%D1%84%D0%B5%D1%81%D1%96%D0%B9%D0%BD%D0%B0+%D0%9A%D1%80%D0%B0%D1%81%D0%B0/@48.9262717,24.7076726,17z/data=!3m1!5s0x4730c112622894c5:0xdf094cdebbe48fb8!4m6!3m5!1s0x4730c11267dd82d7:0xffa134d50f0429fb!8m2!3d48.9264149!4d24.7098866!16s%2Fg%2F11c2mcpfls?hl=uk-ua&entry=ttu",
        },
      ],
      [
        {
          text: "Калуш | вул. Лесі Українки, 82",
          url: "https://www.google.com.ua/maps/place/%D0%9F%D1%80%D0%BE%D1%84%D0%B5%D1%81%D1%96%D0%B9%D0%BD%D0%B0+%D0%BA%D1%80%D0%B0%D1%81%D0%B0/@49.0276151,24.3605875,18.79z/data=!4m6!3m5!1s0x4730a3afb7601c4d:0xf66dcadb15aae42e!8m2!3d49.0275232!4d24.3604377!16s%2Fg%2F11fd48_t8k?entry=ttu",
        },
      ],
      [
        {
          text: "Коломия | бульвар Лесі Українки, 5",
          url: "https://www.google.com/maps/place/%D0%9F%D1%80%D0%BE%D1%84%D0%B5%D1%81%D1%96%D0%B9%D0%BD%D0%B0+%D0%BA%D1%80%D0%B0%D1%81%D0%B0/@48.5296251,25.0415165,15z/data=!4m6!3m5!1s0x4736d378145ece17:0x1a8da29addda9136!8m2!3d48.5296251!4d25.0415165!16s%2Fg%2F11h29m8975?hl=uk&entry=ttu",
        },
      ],
    ],
    resize_keyboard: true,
  },
};

const socialKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Інтернет-магазин",
          url: "https://krasa.market",
        },
        {
          text: "Instagram",
          url: "https://instagram.com/profesiyna_krasa?igshid=YzAwZjE1ZTI0Zg==",
        },
      ],
    ],
    resize_keyboard: true,
  },
};

module.exports = { storesKeyboard, socialKeyboard };
