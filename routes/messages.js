const express = require("express")
const router = express.Router()
const Message = require("../models/Message")
const requireAuth = require("../middleware/authMiddleware")

// gets all messages of the db, need auth, get sorted, shown with username
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("📥 Fetching all messages...") // Debugging log
    const messages = await Message.find().populate("author", "username").sort({ createdAt: -1 })

    console.log("✅ Messages retrieved:", messages.length)
    res.json(messages)
  } catch (error) {
    console.error("❌ Error fetching messages:", error)
    res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
})

// saves message and sends to all users
router.post("/", requireAuth, async (req, res) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ message: "Message content is required" })

    console.log("🔍 req.user:", req.user) // debug: Check if user ID is present
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const newMessage = new Message({
      content,
      author: req.user.userId,
    })

    await newMessage.save()
    console.log("✅ Message saved:", newMessage)

   
    await newMessage.populate("author", "username")

    // send the new message via Socket.io
    const io = req.app.get("io")
    if (io) {
      io.emit("newMessage", newMessage)
      console.log("📢 Message broadcasted via Socket.io")
    } else {
      console.error("❌ Socket.io instance not found in app")
    }

    res.status(201).json(newMessage)
  } catch (error) {
    console.error("❌ Error sending message:", error)
    res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
})

module.exports = router
