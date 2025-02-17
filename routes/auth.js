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
    if (!user || user.twoFactorCode !== twoFactorCode || Date.now() > user.twoFactorExpires) {
      return res.status(400).json({ message: "Invalid or expired 2FA code" });
    }

    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error verifying 2FA", error });
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

module.exports = router;
