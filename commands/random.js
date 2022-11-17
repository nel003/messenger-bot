const axios = require("axios");
const https = require("https");
const Permissions = require("../model/Permissions");

module.exports = async function random(api, message) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("gwapo")) {
    return;
  }

  const ranPage = Math.floor(Math.random() * 101);
  const ranPic = Math.floor(Math.random() * 96);

  const res = await axios(
    `https://community-uploads.highwinds-cdn.com/api/v9/community_uploads?channel_name__in[]=media&channel_name__in[]=nsfw-general&query_method=nav-to-page&page=${ranPage}&loc=https://hanime.tv`
  );
  const data = res.data.data;
  const pic = data[ranPic];

  const info = await api.getUserInfo(message.senderID);
  const { name, firstName } = info[message.senderID];

  https.get(pic.proxy_url).on("response", (stream) => {
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
    }
  });
};
