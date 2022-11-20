const Permissions = require("../model/Permissions");
require("dotenv").config();

module.exports = async function grant(api, message) {
  if (message.senderID == process.env.OWNER) {
    await Permissions.deleteMany({threadID: message.threadID});
  }
};
