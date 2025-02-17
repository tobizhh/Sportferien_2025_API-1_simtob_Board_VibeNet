const express = require("express");
const User = require("../models/User");

const router = express.Router();

// 📌 Send Friend Request
router.post("/request", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const receiver = await User.findById(receiverId);

    if (!receiver) return res.status(404).json({ message: "User not found" });

    if (receiver.friendRequests.includes(senderId) || receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Friend request already sent or user is already a friend" });
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();
    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📌 Accept Friend Request
router.post("/accept", async (req, res) => {
  try {
    const { userId, senderId } = req.body;
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) return res.status(404).json({ message: "User not found" });

    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No friend request found" });
    }

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    user.friends.push(senderId);
    sender.friends.push(userId);

    await user.save();
    await sender.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 📌 Get Friends List
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friends", "username email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Get friend requests for a user
router.get("/friend-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("friendRequests", "username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ requests: user.friendRequests });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;


// ✅ Export the Express Router
module.exports = router;
