const googleIt = require("google-it");
const axios = require("axios");
const Permissions = require("../model/Permissions");

module.exports = async (api, message, sentence) => {
  
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("search")) {
    return;
  }

  const info = await api.getUserInfo(message.senderID);
  const { name, firstName } = info[message.senderID];

  if (sentence.trim() === "") {
    api.sendMessage(
      {
        body: `@${firstName} Please provide some input.`,
        mentions: [
          {
            tag: `@${firstName}`,
            id: message.senderID,
          },
        ],
      },
      message.threadID
    );
    return;
  }
  let stringResult = "";
  try {
    const res = await googleIt({
      query: sentence,
      limit: 5,
      disableConsole: true,
    });

    for (let i = 0; i < res.length; i++) {
      stringResult += `\n${res[i].title}\n${res[i].link}\n${res[i].snippet}`;
      stringResult += "\n";
    }
  } catch (e) {
    console.log(e);
  }

  api.sendMessage(
    {
      body: `@${firstName} Here's the results 👍\n${stringResult}`,
      mentions: [
        {
          tag: `@${firstName}`,
          id: message.senderID,
        },
      ],
    },
    message.threadID
  );
};
