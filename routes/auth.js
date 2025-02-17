const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendEmail(to, subject, text) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    text,
  };
  try {
    await sgMail.send(msg);
    console.log(`✅ E-Mail an ${to} gesendet`);
  } catch (error) {
    console.error("❌ Fehler beim Senden der E-Mail:", error.response ? error.response.body : error);
  }
}

// Register User
router.post("/register", async (req, res) => {
  try {
    console.log("Registrierungsanfrage erhalten:", req.body);
    const { username, email, password, enableTwoFactor } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Benutzer existiert bereits" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      twoFactorEnabled: enableTwoFactor 
    });

    await newUser.save();
    res.status(201).json({ message: "Benutzer erfolgreich registriert" });
  } catch (error) {
    console.error("Fehler bei der Registrierung:", error);
    res.status(500).json({ message: "Interner Serverfehler", error: error.message });
  }
});

// Verify 2FA Code
router.post("/two-factor", async (req, res) => {
  const { email, twoFactorCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({ message: "2FA code not requested or expired" });
    }

    if (Date.now() > user.twoFactorExpires) {
      return res.status(400).json({ message: "2FA code expired. Request a new one." });
    }

    if (user.twoFactorCode !== twoFactorCode) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    // ✅ Clear the 2FA code after successful verification
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, userId: user._id, message: "2FA verification successful" });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Login mit 2FA-Unterstützung
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Benutzer nicht gefunden" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Falsches Passwort" });

    // Falls 2FA aktiviert ist, generiere und sende den Code per Mail
    if (user.twoFactorEnabled) {
      const code = generateCode();
      user.twoFactorCode = code;
      user.twoFactorExpires = Date.now() + 300000; // 5 Min gültig
      await user.save();

      await sendEmail(user.email, "Ihr 2FA-Code", `Ihr 2FA-Code lautet: ${code}`);
      return res.json({ requireTwoFactor: true });
    }

    // Falls 2FA nicht aktiviert ist, erzeuge direkt ein Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Fehler beim Login:", error);
    res.status(500).json({ message: "Interner Serverfehler" });
  }
});

// Send Friend Request
router.post("/friends/request", async (req, res) => {
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

// Accept Friend Request
router.post("/friends/accept", async (req, res) => {
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

// Get Friends List
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friends", "username email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
