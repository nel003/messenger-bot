const login = require("fca-unofficial");
const express = require("express");
const app = express();
const axios = require("axios");
const save = require("./utils/saveToDB");
const db = require("./dbConnect");
const antiUnsent = require("./utils/antiUnsent");
const gwapo = require("./commands/gwapo");
const cute = require("./commands/cute");
const random = require("./commands/gs");
const grant = require("./commands/grant");
const rmp = require("./commands/rmp");
require("dotenv").config();

const allCommands = ["gwapo", "gs", "cute"];

app.head("/", (req, res) => {
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
      const msgToList = message.body.split(" ").filter((i) => i.trim() != "");

      //permissions
      if (msgToList[0] === "/grant") {
        if (msgToList[1] === "all") {
          await grant(api, message, allCommands);
        } else {
          await grant(api, message, msgToList.slice(1, msgToList.length));
        }
      }
      if (message.body === "/rmp") {
        await rmp(api, message);
      }
      //allCommands
      if (message.body === "/gwapo") {
        await gwapo(api, message);
      }
      if (message.body === "/cute") {
        await cute(api, message);
      }
      if (message.body === "/gs") {
        random(api, message);
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Running on port 3000...");
});
console.log("Hehe");
