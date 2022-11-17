const Permissions = require("../model/Permissions");
require("dotenv").config();

module.exports = async function grant(api, message, allow) {
  if (message.senderID == process.env.OWNER) {
    const perm = await Permissions.findOne({
      threadID: message.threadID,
    }).exec();
    if (perm === null) {
      const newPerm = new Permissions({
        threadID: message.threadID,
        allowed: allow, 
      });
      await newPerm.save();
    } else {
      await Permissions.replaceOne(
        { threadID: message.threadID },
        {
          threadID: message.threadID,
          allowed: allow,
        }
      );
    }
  }
};
