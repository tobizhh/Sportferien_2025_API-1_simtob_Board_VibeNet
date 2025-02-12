const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);
