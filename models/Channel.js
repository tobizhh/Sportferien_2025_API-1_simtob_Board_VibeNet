const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["text", "voice"], required: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: "Server", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Channel", ChannelSchema);
