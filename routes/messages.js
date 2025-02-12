const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Falls der Parameter keine ObjectId ist, suche per Name
    const channel = mongoose.Types.ObjectId.isValid(channelId)
      ? await Channel.findById(channelId)
      : await Channel.findOne({ name: channelId });

    if (!channel) return res.status(404).json({ message: "Channel nicht gefunden" });

    const messages = await Message.find({ channel: channel._id }).populate("author", "username");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Abrufen der Nachrichten", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { content, channel } = req.body;
    if (!content || !channel) {
      return res.status(400).json({ message: "Nachricht und Channel erforderlich" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Nicht autorisiert" });
    }

    // Channel abrufen
    const channelDoc = mongoose.Types.ObjectId.isValid(channel)
      ? await Channel.findById(channel)
      : await Channel.findOne({ name: channel });

    if (!channelDoc) {
      return res.status(404).json({ message: "Channel nicht gefunden" });
    }

    const newMessage = new Message({
      content,
      channel: channelDoc._id,
      author: req.user._id, // Sicherstellen, dass `req.user._id` existiert
    });

    await newMessage.save();
    res.status(201).json({ messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Erstellen der Nachricht", error: error.message });
  }
});

module.exports = router;
