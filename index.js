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
const essay = require("./commands/essayWriter");
const story = require("./commands/storyWriter");
const define = require("./commands/definitionWriter");
const google = require("./commands/googleIt");
require("dotenv").config();

const allCommands = [
  "gwapo",
  "gs",
  "cute",
  "essay",
  "story",
  "search",
  "define",
];

app.get("/", (req, res) => {
  res.send("Hello GET");
});

app.head("/", (req, res) => {
  res.send("Hello HEAD");
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

    //Unsend
    if (message.type === "message_reaction") {
      const myID = api.getCurrentUserID();
      const mSenderId = message.senderID;
      if(process.env.OWNER != message.userID){
        return;
      }
      if (myID != mSenderId) {
        return;
      }
      if (message.reaction != "😠") {
        return;
      }
      api.unsendMessage(message.messageID);
    }

    //Commands
    if (message.type === "message") {
      await save(api, message);
      const msgToList = message.body.split(" ").filter((i) => i.trim() != "");

      //permissions
      if (msgToList[0] === "#grant") {
        if (msgToList[1] === "all") {
          await grant(api, message, allCommands);
        } else {
          await grant(api, message, msgToList.slice(1, msgToList.length));
        }
      }
      if (message.body === "#rmp") {
        await rmp(api, message);
      }

      //acads commands
      if (msgToList[0] === "#essay") {
        await essay(api, message, message.body.replace("#essay", ""));
      }
      if (msgToList[0] === "#define") {
        await define(api, message, message.body.replace("#define", ""));
      }
      if (msgToList[0] === "#story") {
        await story(api, message, message.body.replace("#story", ""));
      }
      if (msgToList[0] === "#search") {
        await google(api, message, message.body.replace("#search", ""));
      }

      //monggoloid commands
      if (message.body === "#gwapo") {
        await gwapo(api, message);
      }
      if (message.body === "#cute") {
        await cute(api, message);
      }
      if (message.body === "#gs") {
        random(api, message);
      }
      //END
    }
  });
});

app.listen(3000, () => {
  console.log("Running on port 3000...");
});
console.log("Hehe");
