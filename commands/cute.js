const fs = require("fs");
const Permissions = require("../model/Permissions");

module.exports = async function cute(api, message) {
  const has = await Permissions.findOne({ threadID: message.threadID });
  if (has === null) {
    return;
  }
  if (!has.allowed.includes("cute")) {
    return;
  }

  const msg = {
    body: "",
    attachment: fs.createReadStream("./assets/cute.jpg"),
  };
  api.sendMessage(msg, message.threadID);
};
