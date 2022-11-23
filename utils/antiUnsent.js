const Messages = require("../model/Messages");
const shorten = require("../utils/urlShort");
const https = require("https");

require("dotenv").config();

module.exports = async function antiUnsent(api, message) {
  const messages = Messages.findOne({ ID: message.messageID });
  await messages.exec(async (err, res) => {
    if (err) return console.error(err);
    if (res === null) {
      return;
    }

    let links = "";
    const streams = [];
    const attach = res.attachments;

    for (let i = 0; i < attach.length; i++) {
      const link = await shorten(attach[i]);
      links += `\n${link}`;
    }

    const msg = {
      body: `@${res.from} unsent: ${res.body} ${links}`,
      mentions: [
        {
          tag: `@${res.from}`,
          id: res.userID,
        },
      ],
    };

    api.sendMessage(msg, message.threadID);
  });
};
