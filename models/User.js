const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: { type: String, default: null },
  twoFactorExpires: { type: Date, default: null },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // List of friends
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Incoming requests
});

module.exports = mongoose.model("User", UserSchema);
