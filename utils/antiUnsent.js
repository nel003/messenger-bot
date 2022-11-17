const Messages = require("../model/Messages");
const axios = require("axios");
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
      const data = {
        domain: "bit.ly",
        long_url: attach[i],
      };
      const resp = await axios({
        method: "POST",
        url: "https://api-ssl.bitly.com/v4/shorten",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BIT_TOKEN}`,
        },
        data: JSON.stringify(data),
      });

      links += `\n${resp.data.link}`;
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
