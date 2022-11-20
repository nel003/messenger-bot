const axios = require("axios");
const https = require("https");
const Permissions = require("../model/Permissions");

module.exports = async function cute(api, message) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("cute")) {
    return;
  }
  
  const res = await axios(
    `https://api.phamvandien.xyz/images/mong`
  );
  
  const info = await api.getUserInfo(message.senderID);
  const { name, firstName } = info[message.senderID];
  
  https.get(res.data.url).on("response", (stream) => {
    try {
      api.sendMessage(
        {
          body: `@${firstName} Here's your request😎`,
          attachment: [stream],
          mentions: [
            {
              tag: `@${firstName}`,
              id: message.senderID,
            },
          ],
        },
        message.threadID
      );
    } catch (e) {
      return random(api, message);
    };
});
}