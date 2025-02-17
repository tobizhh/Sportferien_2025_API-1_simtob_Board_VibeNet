const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");

// ✅ GET messages for a specific channel
router.get("/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    console.log("🔍 Received request for channel ID:", channelId);

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID format" });
    }

    const messages = await Message.find({ channel: channelId }).populate("author");
    if (!messages) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



router.post("/", async (req, res) => {
  try {
    const { content, channel, author } = req.body;

    if (!content || !channel || !author) {
      return res.status(400).json({ message: "Content, channel, and author are required" });
    }

    const newMessage = new Message({
      content,
      channel,
      author, // 🔥 Autor speichern!
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent", messageData: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




module.exports = router;
