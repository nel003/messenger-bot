const mongoose = require("mongoose");
// Set up default mongoose connection
const mongoDB =
  "mongodb+srv://nel003:nel003@cluster0.abnhq.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }, async (err) => {
  if (err) return console.error(err);
  console.log("Connected to mongodb");
});
// Get the default connection
const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;