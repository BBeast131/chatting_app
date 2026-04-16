const appJson = require("./app.json");
require("dotenv").config();

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      WS_URL: process.env.WS_URL ?? "",
      WS_USER: process.env.WS_USER ?? "",
      WS_TOKEN: process.env.WS_TOKEN ?? "",
    },
  },
};
