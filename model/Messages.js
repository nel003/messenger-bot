const mongoose = require("mongoose");

const Model = new mongoose.Schema({
  ID: String,
  from: String,
  userID: String,
  body: String,
  attachments: Array,
});

const Messages = mongoose.model("Messages", Model);
module.exports = Messages;