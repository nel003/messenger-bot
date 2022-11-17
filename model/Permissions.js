const mongoose = require("mongoose");

const Model = new mongoose.Schema({
  threadID: String,
  allowed: Array
});

const Permissions = mongoose.model("Permissions", Model);
module.exports = Permissions;