const login = require("fca-unofficial");
const express = require("express");
const app = express();
const save = require("./utils/saveToDB");
const db = require("./dbConnect");
const antiUnsent = require("./utils/antiUnsent");
const gwapo = require("./commands/gwapo");
const cute = require("./commands/cute");
const random = require("./commands/random");
const grant = require("./commands/grant");
require("dotenv").config();

const allCommands = ["gwapo", "random", "cute"];

app.get("/", (req, res) => {
  res.send("Hello");
});

login({ appState: JSON.parse(process.env.APPSTATE) }, (err, api) => {
  api.setOptions({ listenEvents: true });

  api.listenMqtt(async (err, message) => {
    //console.log(message);
    if (message.type === "message_unsend") {
      await antiUnsent(api, message);
    }

    if (message.type === "message_reply") {
      await save(api, message);
    }

    if (message.type === "message") {
      await save(api, message);

      if (message.body === "/grant") {
        await grant(api, message, allCommands);
      }
      if (message.body === "/gwapo") {
        await gwapo(api, message);
      }
      if (message.body === "/cute") {
        await cute(api, message);
      }
      if (message.body === "/random") {
        random(api, message);
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Running on port 3000...");
});
