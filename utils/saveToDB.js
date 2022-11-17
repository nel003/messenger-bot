const Messages = require("../model/Messages");

module.exports = async function save(api, message) {
  const files = [];
  const info = await api.getUserInfo(message.senderID);
  const { body, attachments } = message;
  attachments.map((a) => {
    files.push(a.url);
  });
  const data = new Messages({
    ID: message.messageID,
    from: info[message.senderID].name, 
    userID: message.senderID,
    body: message.body,
    attachments: files,
  });
  await data.save();
};
