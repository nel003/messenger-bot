const fs = require("fs");
const Permissions = require("../model/Permissions");

module.exports = async function gwapo(api, message) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("gwapo")) {
    return;
  }
  const msg = {
    body: "",
    attachment: fs.createReadStream("./assets/gwapo.png"),
  };
  api.sendMessage(msg, message.threadID);
};
